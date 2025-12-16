<p align='center'>
  <img src='https://user-images.githubusercontent.com/11247099/111864893-a457fd00-899e-11eb-9f05-f4b88987541d.png' alt='Vitesse - Opinionated Vite Starter Template' width='600'/>
</p>

<h6 align='center'>
<a href="https://vitesse-lite.netlify.app/">Live Demo</a>
</h6>

<h5 align='center'>
<b>Lightweight version of <a href="https://github.com/antfu/vitesse">Vitesse</a></b>
</h5>

<br>

<p align='center'>
<b>English</b> | <a href="https://github.com/antfu-collective/vitesse-lite/blob/main/README.zh-CN.md">简体中文</a>
<!-- Contributors: Thanks for geting interested, however we DON'T accept new transitions to the README, thanks. -->
</p>

## Features

- ⚡️ [Vue 3](https://github.com/vuejs/core), [Vite](https://github.com/vitejs/vite), [pnpm](https://pnpm.io/), [ESBuild](https://github.com/evanw/esbuild) - born with fastness

- 🗂 [File based routing](./src/pages)

- 📦 [Components auto importing](./src/components)

- 🎨 [UnoCSS](https://github.com/antfu/unocss) - The instant on-demand atomic CSS engine.

- 😃 Use icons from any icon sets in [Pure CSS](https://github.com/antfu/unocss/tree/main/packages/preset-icons)

- 🔥 Use the [new `<script setup>` style](https://github.com/vuejs/rfcs/pull/227)

- ✅ Use [Vitest](http://vitest.dev/) for unit and components testing

- 🦾 TypeScript, of course

- ☁️ Deploy on Netlify, zero-config

<br>

See [Vitesse](https://github.com/antfu/vitesse) for full featureset.

## Project Plan

- 2024-XX: Added backend API work plan for the 帕神库存管理系统, see [API_PLAN.md](./API_PLAN.md) for details.

## 帕神库存管理定制内容

- Set `VITE_API_BASE_URL` in `.env.development` (`http://localhost:5001/`) and `.env.production` (`https://api.sis.tagzxia.com/`) so the frontend knows where to call the backend.
- Configure `VITE_APP_TITLE` in the same env files to control the browser tab title (`''` when unset keeps the tab blank).
- New routes `/auth/login` and `/auth/register` let you create accounts and fetch the protected user list using the documented APIs.
- Login/register pages now swallow API exceptions to avoid Vue "Unhandled error" noise, and display friendlier messages to the user.
- `/plan` renders the contents of `API_PLAN.md` inside the app to keep implementation progress visible to everyone.
- `src/services` now contains a lightweight API client plus auth/dashboard service matching the shared API spec.

## Troubleshooting

- Seeing `not a valid bcrypt hash` on login usually means the backend stored an invalid password hash for that user (bad seed / legacy plaintext). Fix it on the backend side by resetting that user's password (rehash) or re-initializing the auth database.

## Dropped Features from [Vitesse](https://github.com/antfu/vitesse)

- ~~i18n~~
- ~~Layouts~~
- ~~SSG~~
- ~~PWA~~
- ~~Markdown~~

## Pre-packed

### UI Frameworks

- [UnoCSS](https://github.com/antfu/unocss) - The instant on-demand atomic CSS engine.

### Icons

- [Iconify](https://iconify.design) - use icons from any icon sets [🔍Icônes](https://icones.netlify.app/)
- [Pure CSS Icons via UnoCSS](https://github.com/antfu/unocss/tree/main/packages/preset-icons)

### Plugins

- [Vue Router](https://github.com/vuejs/vue-router)
  - [`unplugin-vue-router`](https://github.com/posva/unplugin-vue-router) - file system based routing
- [`unplugin-auto-import`](https://github.com/antfu/unplugin-auto-import) - Directly use Vue Composition API and others without importing
- [`unplugin-vue-components`](https://github.com/antfu/unplugin-vue-components) - components auto import
- [`unplugin-vue-macros`](https://github.com/sxzz/unplugin-vue-macros) - Explore and extend more macros and syntax sugar to Vue.
- [VueUse](https://github.com/antfu/vueuse) - collection of useful composition APIs

## Try it now!

### GitHub Template

[Create a repo from this template on GitHub](https://github.com/antfu-collective/vitesse-lite/generate).

### Clone to local

If you prefer to do it manually with the cleaner git history

```bash
npx degit antfu-collective/vitesse-lite my-vitesse-app
cd my-vitesse-app
pnpm i # If you don't have pnpm installed, run: npm install -g pnpm
```
