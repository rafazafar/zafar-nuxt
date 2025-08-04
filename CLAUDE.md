# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Nuxt 4, showcasing Zafar's work, experience, and blog posts. The site is configured for deployment on Cloudflare with static site generation for blog content.

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
  - `pages/` - File-based routing (index, about, projects, speaking, blog)
  - `components/` - Vue components, organized with `landing/` subfolder for homepage sections
  - `layouts/` - Layout components
  - `assets/css/` - Global CSS
  - `utils/` - Utility functions (clipboard, links)
- `content/` - Content collections managed by Nuxt Content
  - `blog/` - Blog posts in Markdown
  - `projects/` - Project data in YAML
  - Individual YAML files for page content (about.yml, speaking.yml, etc.)
- `public/` - Static assets including images organized by project/category
- `server/` - Server-side code

### Key Technologies
- **Nuxt 4** (upgraded from v3 with full v4 support)
- **Nuxt UI Pro** for UI components
- **Nuxt Content** for content management with structured collections
- **Nuxt Image** for optimized images
- **Motion-v** for animations
- **VueUse** for Vue composition utilities
- **Nuxt OG Image** for social media previews
- **Better SQLite3** for potential database operations

### Content Management
The project uses a sophisticated content management system via Nuxt Content with:
- Typed content collections defined in `content.config.ts`
- YAML-based content for structured data (projects, speaking events, page content)
- Markdown-based blog posts with frontmatter
- Image management through structured schemas

### Deployment Configuration
- **Target**: Cloudflare Pages with module preset
- **Prerendering**: Static generation for `/` and `/blog/*` routes
- **Route Rules**: Blog routes are SSR disabled and statically generated
- **Observability**: Cloudflare logging enabled

### Styling and UI
- Custom CSS in `assets/css/main.css`
- Nuxt UI components with consistent design system
- Dark/light mode support via ColorModeButton component
- ESLint configured with specific stylistic rules (1tbs brace style, no comma dangle)

## Development Notes

### Content Structure
Each content collection has a defined schema:
- **Blog posts**: Require minRead, date, image, and author fields
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