# hikkocode

AI-конструктор веб-приложений: пользователь описывает приложение текстом, LLM
генерирует файлы проекта, результат сразу рендерится в live-превью в браузере.

## Стек

| Слой | Технологии |
| --- | --- |
| Frontend | Vite 5, React 18, TypeScript, React Router, TanStack Query |
| UI | Tailwind CSS, shadcn/ui (Radix), lucide-react, highlight.js |
| Backend | Supabase (Postgres + RLS, Auth, Realtime, Edge Functions на Deno) |
| LLM | Gemini (`gemini-2.5-flash`) напрямую и через AI-gateway (`google/gemini-3.1-pro-preview`) |
| Тесты | Vitest + jsdom |

## Требования

- Node.js >= 20 (проверено на 22.x), npm 10+
- Аккаунт Supabase + `supabase` CLI (для миграций и деплоя функций)

> В репозитории раньше лежали `bun.lock`/`bun.lockb` — они удалены.
> Канонический пакетный менеджер — **npm**.

## Быстрый старт

```bash
npm ci
cp .env.example .env      # заполнить VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev               # http://localhost:8080
```

Без валидных значений в `.env` приложение падает при старте
(`createClient('', '')` → «supabaseUrl is required»).

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | dev-сервер Vite на порту 8080 |
| `npm run build` | production-сборка в `dist/` |
| `npm run preview` | локальный просмотр собранного бандла |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Настройка Supabase

1. Применить миграции:

   ```bash
   supabase link --project-ref <ref>
   supabase db push          # или supabase db reset для локальной БД
   ```

   Миграции идемпотентны (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`,
   защищённые `ALTER PUBLICATION`), поэтому повторный прогон безопасен.

2. Задеплоить edge-функции:

   ```bash
   supabase functions deploy plan chat generate agent indexer github
   ```

3. Прописать секреты функций:

   ```bash
   supabase secrets set \
     LOVABLE_API_KEY=... \
     GEMINI_API_KEYS=key1,key2 \
     GITHUB_PAT=ghp_...
   ```

   Назначение каждого секрета описано в `.env.example`.

## Ключи Gemini на стороне пользователя

Пользователь может ввести собственный Gemini API key в UI
(`src/components/ApiKeyDialog.tsx`); он хранится в `localStorage` под ключом
`hikko_gemini_api_key` и передаётся в edge-функции генерации.

## Известные ограничения

- Основной JS-бандл ~1 МБ (≈300 кБ gzip), код-сплиттинга нет.
- `npm run lint` пока даёт ошибки (в основном `no-explicit-any`) — в CI не гейтит.

## Авторизация вызовов Edge Functions

Все функции задеплоены с `verify_jwt = true`, поэтому любой вызов должен нести
JWT текущей сессии пользователя. На фронтенде для прямых `fetch` используется
`src/lib/functionAuth.ts` (`getFunctionHeaders()`); вызовы через
`supabase.functions.invoke()` подставляют токен сами. Если сессии нет,
`getFunctionHeaders()` бросает `NotAuthenticatedError`, UI показывает toast и
редиректит на `/auth`.

## Документация

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — модель данных, два пайплайна генерации,
  ограничения.
