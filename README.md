# Risu — менеджер подписок и регулярных платежей

[![CI/CD](https://github.com/Neckser/Risu/actions/workflows/ci.yml/badge.svg)](https://github.com/Neckser/Risu/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/live-neckser.github.io%2FRisu-5d3eff)](https://neckser.github.io/Risu/)

Веб-приложение для отслеживания подписок и регулярных расходов: каталог подписок с категориями, лимиты на категории, аналитика расходов и напоминания о ближайших списаниях.

## Демо

**[https://neckser.github.io/Risu/](https://neckser.github.io/Risu/)**

Демо-доступ для быстрой проверки:

- **Email:** `demo@risu.app`
- **Пароль:** `demo1234`

На странице логина есть кнопка **«Заполнить демо-данными»** — заполняет форму одним кликом. После входа доступен предзагруженный набор из 5 подписок (Netflix, Spotify, PlayStation Plus, iCloud, GitHub Copilot) и 6 категорий.

## Стек

- **Framework:** Angular 21 (standalone components, signals, control-flow `@if`/`@for`/`@switch`)
- **UI library:** [Taiga UI 5](https://taiga-ui.dev) (TuiButton, TuiIcon, TuiRoot, TuiAlertService, TuiBadgeNotification, TuiToastService)
- **State management:** [NgRx Signal Store](https://ngrx.io/guide/signals/signal-store) (`@ngrx/signals` + `rxMethod`)
- **Forms:** Reactive Forms (typed FormGroup), нативные `<input>/<select>/<textarea>` со стилизацией через CSS-переменные Taiga
- **HTTP / Mock API:** функциональные `HttpInterceptor` (auth + error + mock backend в `localStorage`)
- **Tests:** [Vitest](https://vitest.dev) для unit (42 теста) + [Playwright](https://playwright.dev) для E2E (8 сценариев в 3 файлах)
- **Lint:** ESLint flat config (`@angular-eslint`, `typescript-eslint`) + Stylelint (`stylelint-config-standard-scss`) + Prettier
- **CI/CD:** GitHub Actions → GitHub Pages (lint → test → e2e → build → deploy)

## Структура проекта

```
src/app/
├── core/                       # Инфраструктура: одноразовые сервисы, перехватчики, layout
│   ├── api/
│   │   ├── api.config.ts           # API_BASE_URL и пути
│   │   ├── error.interceptor.ts    # Глобальный обработчик HTTP-ошибок + тосты
│   │   ├── mock-api.interceptor.ts # Mock-backend для всех /api/* запросов
│   │   └── mock/mock-database.ts   # In-memory БД с persist в localStorage
│   ├── auth/
│   │   ├── auth.service.ts         # HTTP-вызовы login/register/me
│   │   ├── auth.store.ts           # Signal Store состояния пользователя
│   │   ├── auth.guard.ts           # authGuard + guestGuard
│   │   ├── auth.interceptor.ts     # Bearer-токен в Authorization header
│   │   └── models/                 # User, AuthResponse и т.д.
│   ├── notifications/
│   │   └── notifications.service.ts # Computed-список ближайших списаний
│   └── layout/
│       └── shell.component.*       # Sidebar-навигация
├── shared/                     # Переиспользуемое: модели, пайпы, чистые компоненты
│   ├── models/                     # Subscription, Category, Currency, Periodicity
│   ├── pipes/                      # daysUntil, monthlyCost, categoryLabel
│   └── components/                 # StatCardComponent, PageHeaderComponent
├── stores/                     # Глобальные Signal Store
│   ├── subscriptions.store.ts      # CRUD + computed (search/filter/sort, агрегации)
│   └── categories.store.ts         # Список категорий + setLimit
├── features/                   # Lazy-loaded маршруты приложения
│   ├── auth/                       # login + register с собственным AuthShell
│   ├── dashboard/                  # Главная страница со статистикой
│   ├── subscriptions/              # CRUD-страницы подписок
│   ├── categories/                 # Управление лимитами категорий
│   └── settings/                   # Аккаунт и сброс mock-данных
├── app.component.ts            # Root: <tui-root><router-outlet /></tui-root>
├── app.config.ts               # ApplicationConfig: providers, interceptors
└── app.routes.ts               # Главные роуты с lazy loading
```

## Запуск локально

Требуется **Node.js 20+**.

```bash
git clone https://github.com/Neckser/Risu.git
cd Risu
npm install --legacy-peer-deps
npm start
```

Сайт запустится на `http://localhost:4200/`. Откроется страница логина — нажми «Заполнить демо-данными» → «Войти».

## Команды

| Команда | Что делает |
|---|---|
| `npm start` | Dev-сервер (`ng serve`) на `http://localhost:4200/` |
| `npm run build` | Dev-сборка |
| `npm run build:prod` | Production-сборка |
| `npm run build:gh-pages` | Production-сборка с base-href для GitHub Pages + копия `index.html → 404.html` |
| `npm test` | Unit-тесты (Vitest, 42 теста, ~1.3 секунды) |
| `npm run test:watch` | Unit-тесты в watch-режиме |
| `npm run test:e2e` | Playwright E2E (8 сценариев в 3 файлах, ~17 секунд) |
| `npm run test:e2e:ui` | Playwright в UI-режиме (визуальный run) |
| `npm run lint` | ESLint на TS + HTML (src + e2e) |
| `npm run lint:fix` | ESLint с автоисправлением |
| `npm run lint:styles` | Stylelint на SCSS |
| `npm run format` | Форматирование Prettier |
| `npm run format:check` | Проверка форматирования без изменений |

### Playwright

Перед первым запуском E2E на новой машине:

```bash
npx playwright install chromium
```

(Скачивает движок Chromium ~150 МБ в `~/.cache/ms-playwright/`, не в проект.)

## Архитектура

### Авторизация

1. Пользователь логинится → `AuthService.login()` POST'ит `/api/auth/login`.
2. **Mock-API** проверяет хеш пароля и возвращает `{ token, user }`.
3. **AuthService** сохраняет токен в `localStorage`, **AuthStore** обновляет signal.
4. **AuthInterceptor** добавляет `Authorization: Bearer <token>` к последующим запросам к `/api/*`.
5. **AuthGuard** проверяет `isAuthenticated` на защищённых маршрутах; **guestGuard** наоборот не пускает залогиненных на `/auth/*`.
6. При закрытии и открытии вкладки **AuthStore.restoreSession()** в `onInit` восстанавливает состояние из `localStorage`.

### Mock-сервер

Полностью in-browser. `mockApiInterceptor` перехватывает все запросы к `/api/*` и маршрутизирует их на `MockDatabase`, которая хранит данные в `localStorage` под ключом `risu_mock_db_v1`. При первом заходе сидится демо-юзером и 5 подписками. Все запросы имеют искусственную задержку 250 мс, чтобы UI корректно показывал loading-state.

### State management

3 Signal Store, все с `providedIn: 'root'`:

- **AuthStore** — `user`, `token`, `loading`, `error`. Computed: `isAuthenticated`. Методы: `login`, `register`, `logout`, `restoreSession` (через `rxMethod` для async, обычные методы для синхронных).
- **SubscriptionsStore** — `items`, `loading`, `loaded`, `error`, `search`, `filterCategory`, `filterStatus`, `sortKey`, `sortDir`. Computed: `activeItems`, `totalMonthlyCost`, `totalYearlyCost`, `countByCategory`, `spendByCategory`, `visibleItems` (с применением фильтров и сортировки). HTTP-методы: `load`, `create`, `update`, `remove`, `toggleActive`.
- **CategoriesStore** — `items`, `loading`, `loaded`. Методы: `load`, `setLimit`.

## Lighthouse

Скриншот отчёта: [`docs/lighthouse-mobile.png`](docs/lighthouse-mobile.png)


## Документация

- [`docs/plan.md`](docs/plan.md) — план разработки, сценарии, этапы, риски
- [`docs/ux.md`](docs/ux.md) — UX-концепция, персоны, user stories, дизайн-система, ссылка на Figma

## Ограничения

- **Хранение данных** — `localStorage` браузера. На разных устройствах/браузерах независимые БД.

- **Очистка данных сайта** в DevTools полностью обнулит каталог. Кнопка «Сбросить данные» в настройках делает то же программно.
