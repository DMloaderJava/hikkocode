# Архитектура hikkocode

## 1. Общая карта

```
src/
  pages/            Index (лендинг), Auth, Builder (основной IDE), NotFound
  context/          AppContext.tsx — единственный стор приложения
  components/
    builder/        ChatPanel, LivePreview, CodeEditor, AgentTasksPanel,
                    VersionHistory, Terminal, TaskCard ...
    ui/             shadcn/ui примитивы
  lib/              perFileAgent.ts, fileTools.ts, agentApi.ts, diff.ts, utils.ts
  integrations/supabase/client.ts
supabase/
  functions/        plan, chat, generate, agent, indexer, github (Deno)
  migrations/       схема БД + RLS + realtime
```

Роутинг (`src/App.tsx`): `/` → лендинг, `/auth` → вход/регистрация,
`/builder` → защищённый маршрут, `*` → 404.

## 2. Модель данных

Состояние приложения целиком лежит в `src/context/AppContext.tsx` (обычный
`useState`, без Redux/Zustand). Основные сущности:

| Тип | Смысл | Персистентность |
| --- | --- | --- |
| `GeneratedFile` | файл виртуального проекта (`name`, `path`, `language`, `content`) | таблица `project_files` |
| `Project` | проект пользователя (`name`, `description`, `version`) | таблица `projects` |
| `ChatMessage` | сообщение чата (`role`, `content`) | таблица `chat_messages` |
| `GenerationTask` | задача генерации одного файла в UI | только в памяти |
| `VersionSnapshot` | снапшот всех файлов для отката | таблица `version_snapshots` (пишется при каждом `setFiles` и перед откатом, гидрируется в `loadProjects`) |

Сохранение файлов: дебаунс 500 мс, затем `delete()` всех строк проекта +
`insert()` актуального набора. То есть запись — полная перезапись набора файлов,
а не инкрементальный upsert.

Таблицы для серверного агента: `agent_tasks`, `task_logs`, `applied_patches`,
`file_index`. RLS включён везде; `agent_tasks` и `task_logs` добавлены в
публикацию `supabase_realtime`.

## 3. Два независимых пайплайна генерации

Это главный источник путаницы в кодовой базе: пайплайна два, они **не
пересекаются** и решают разные задачи.

### Пайплайн A — браузерный, per-file (основной, используется по умолчанию)

Точка входа: `src/components/builder/ChatPanel.tsx`.

```
пользовательский промпт
  └─> POST /functions/v1/plan          (LLM возвращает план: список файлов)
        └─> buildFileTasks()           (план → список GenerationTask)
              └─> executePerFile()     (src/lib/perFileAgent.ts)
                    ├─ для каждого файла отдельный SSE-стрим генерации
                    └─ файл применяется сразу после генерации
                          └─> diffFiles() → setFiles() → LivePreview
```

Особенности:
- Мгновенная обратная связь: превью обновляется по мере готовности файлов.
- Виртуальная ФС и контекст — `src/lib/fileTools.ts`
  (`readFile`/`writeFile`/`deleteFile`, `createSandbox`/`commitSandbox`,
  `buildSmartContext`/`buildFullContext`).
- Обычный чат без генерации кода идёт в `/functions/v1/chat`.

### Пайплайн B — серверный автономный агент

Точка входа UI: `src/components/builder/AgentTasksPanel.tsx` через
`src/lib/agentApi.ts`.

```
создание задачи
  └─> POST /functions/v1/agent   (supabase/functions/agent/index.ts, ~614 строк)
        план → генерация патчей → build → авто-починка (до max_iterations)
        → коммит и Pull Request в GitHub (functions/github, GITHUB_PAT)
  статус и логи задачи приходят через Supabase Realtime
      (таблицы agent_tasks и task_logs)
  индексация репозитория: POST /functions/v1/indexer → таблица file_index
```

Особенности:
- Работает в фоне на сервере, результат — PR, а не превью в браузере.
- Ничего не знает о состоянии `AppContext`; результат в UI попадает только через
  realtime-логи и ссылку на PR.

**Правило для разработчика:** правки поведения «чата и превью» — это Пайплайн A
(`ChatPanel` + `perFileAgent` + функции `plan`/`chat`/`generate`). Правки
«автономного агента с PR» — Пайплайн B (`AgentTasksPanel` + функции
`agent`/`indexer`/`github`).

## 4. Edge Functions

| Функция | Роль | LLM / секреты |
| --- | --- | --- |
| `plan` | строит план изменений по промпту | AI-gateway, `LOVABLE_API_KEY` |
| `chat` | обычный диалог с ассистентом | `gemini-2.5-flash`, `GEMINI_API_KEYS` |
| `generate` | стриминговая генерация содержимого файла | `gemini-2.5-flash`, `GEMINI_API_KEYS` |
| `agent` | автономный цикл plan→generate→build→fix→PR | `LOVABLE_API_KEY`, `GITHUB_PAT` |
| `indexer` | индексация файлов проекта в `file_index` | `GEMINI_API_KEYS` |
| `github` | работа с GitHub API (репозитории, коммиты, PR) | `GITHUB_PAT` |

Системные промпты живут прямо в `plan`, `chat` и `generate` — менять поведение
модели нужно там.

## 5. Live-превью

`src/components/builder/LivePreview.tsx` собирает из виртуальных файлов один
HTML-документ: вырезает локальные `<link>`/`<script>` и инлайнит CSS/JS, затем
рендерит через `<iframe srcDoc sandbox="allow-scripts allow-modals
allow-same-origin allow-popups allow-forms">`. Это не настоящий бандлер: сложные
импорты между модулями проекта не резолвятся.

## 6. Безопасность

- Все edge-функции: `verify_jwt = true` в `supabase/config.toml`.
- `supabase/functions/_shared/auth.ts` — общий модуль: `corsHeaders`,
  `handleCorsPreflight` (OPTIONS → 204 без JWT), `requireUser` (валидация токена
  через `supabase.auth.getUser()`, 401 при отсутствии/протухании) и
  user-scoped Supabase-клиент, к которому применяется RLS.
- Каждая функция начинается с preflight-проверки и `requireUser`.
- Фронтенд: `src/lib/functionAuth.ts` отдаёт заголовки с `access_token`;
  анонимный ключ больше нигде не используется как Bearer-токен.

## 7. Текущие ограничения и техдолг

- Сохранение файлов через `delete()+insert()` — не атомарно, гонки при частых
  правках.
- Снапшоты версий не подрезаются: у долгоживущего проекта таблица
  `version_snapshots` будет расти неограниченно.
- Один бандл ~1 МБ без код-сплиттинга.
- CI (`.github/workflows/agent-ci.yml`): lint, `tsc --noEmit` и тесты помечены
  `continue-on-error`, реально гейтит только `npm run build`.
