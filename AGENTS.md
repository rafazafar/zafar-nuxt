# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Nuxt 4, showcasing Zafar's work, experience, and blog posts. The site is configured for deployment on Cloudflare.

**Static parts (not Nuxt):** the English homepage is hand-written `public/index.html`, and the blog is static HTML generated from Markdown by `blog/build.mjs` (see `blog/README.md` to add a post). Links into either from the Nuxt app must be full page loads (`external: true`).

## Development Commands

### Core Commands
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun generate` - Generate static site
- `bun preview` - Preview production build

### Code Quality
- `bun lint` - Run ESLint
- `bun lint:fix` - Fix linting issues automatically
- `bun typecheck` - Run TypeScript type checking

### Installation
- `bun install` - Install dependencies (uses Bun as package manager)

## Architecture

### Directory Structure
- `app/` - Main application code
  - `pages/` - File-based routing (index, about, projects, speaking, services)
  - `components/` - Vue components, organized with `landing/` subfolder for homepage sections
  - `layouts/` - Layout components
  - `assets/css/` - Global CSS
  - `utils/` - Utility functions (clipboard, links)
- `content/` - Page content as plain YAML, bundled at build time by `app/utils/content.ts` (no Nuxt Content, no database)
  - `projects/` - Project data in YAML
  - Individual YAML files for page content (about.yml, speaking.yml, etc.)
- `public/` - Static assets including images organized by project/category
- `server/` - Server-side code

### Key Technologies
- **Nuxt 4** (upgraded from v3 with full v4 support)
- **Nuxt UI Pro** for UI components
- **Nuxt Image** for optimized images
- **Motion-v** for animations
- **VueUse** for Vue composition utilities
- **Nuxt OG Image** for social media previews

### Content Management
Content is plain YAML in `content/<locale>/`. A small Vite plugin in `nuxt.config.ts` turns `.yml` imports into objects, and `app/utils/content.ts` exposes typed helpers:
- `getPage(locale, 'index' | 'about' | 'speaking' | 'projects')` - falls back to English
- `getProjects(locale)` - every file in `content/<locale>/projects/`, newest first
- `renderMarkdown(text)` - for the short Markdown fields (about text, FAQ answers)

The types for each file live in `app/utils/content.ts`. Edit the YAML and rebuild; there is nothing to query at runtime.

### Deployment Configuration
- **Target**: Cloudflare Workers (`cloudflare_module` preset), configured in `wrangler.jsonc` (Cloudflare's build runs `npx wrangler deploy`, which needs that file)
- **Rendering**: SSR only, no prerendering. `/` and the blog are static files in `public/`, served as assets before the Worker runs
- **Observability**: Cloudflare logging enabled

### Styling and UI
- Custom CSS in `assets/css/main.css`
- Nuxt UI components with consistent design system
- Dark/light mode support via ColorModeButton component
- ESLint configured with specific stylistic rules (1tbs brace style, no comma dangle)

## Development Notes

### Content Structure
Each YAML file has a TypeScript type in `app/utils/content.ts`:
- **Projects**: Include title, description, image, URL, tags, and date
- **Speaking events**: Categorized as Live talk, Podcast, or Conference
- **Index page**: Contains hero, about, experience, testimonials, blog, and FAQ sections

### Component Organization
- Landing page components are in `components/landing/`
- Reusable UI components at root level of `components/`
- App-level components (header, footer) prefixed with "App"

### Image Management
- Images stored in `public/img/` with organized subdirectories
- Image schemas enforce alt text and media input validation
- Optimized image loading via Nuxt Image module

### Internationalization (i18n)
- **@nuxtjs/i18n** module integrated with English and Japanese locales
- Locale files in `i18n/locales/` directory (en.json, ja.json)
- Language selector component in header with globe icon
- Navigation links use `useNavLinks()` composable for translations
- Strategy: `prefix_except_default` (English is default, Japanese uses `/ja` prefix)
- Browser language detection with cookie persistence
- All UI strings extracted to locale files for easy translation