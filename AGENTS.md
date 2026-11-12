# AGENTS.md

Guidance for coding agents working in this repository.

## What this is

zafar.dev, Zafar's personal site. It is **static files only**, deployed to Cloudflare as Workers static assets (`wrangler.jsonc`, no Worker script). There is no framework and no runtime server code apart from `party/`.

- `public/index.html` - the homepage, hand-written HTML/CSS/JS in one file. The hero is a WebGPU shader of the Tokyo sky driven by the real Tokyo time and date (timetable, windows, towers, seasons, moon phase), with a CSS gradient fallback.
- `blog/` - Markdown posts in `blog/posts/<lang>/` (en, ja, de) and `blog/build.mjs`, which renders them to `public/blog/`, `public/ja/blog/`, `public/de/blog/` and `public/404.html`. Templates are in `blog/templates.mjs`, UI text in `blog/strings.mjs`, styles in `blog/blog.css`. See `blog/README.md`.
- `public/_redirects` - sends the retired Nuxt URLs (/projects, /about, /speaking, /services, /ja, /de, …) to the homepage or the ja/de blogs.
- `party/` - a separate Durable Object Worker (`zafar-party`) that syncs the homepage photo pile and serves the weather. It has its own package.json and deploy.

## Commands

- `bun dev` - watch-build the blog and serve `public/` with `wrangler dev`
- `bun run build` - generate the blog
- `bun run deploy` - build, then `wrangler deploy`
- `bun run lint` / `bun run lint:fix` - ESLint (2 spaces, single quotes, no semicolons, no trailing commas, 1tbs)

## Notes

- Never edit generated files under `public/blog`, `public/ja/blog`, `public/de/blog` or `public/404.html`. Change `blog/` and rebuild.
- The design tokens (colours, fonts) in `blog/blog.css` are copied from `public/index.html`. Keep the two in step.
- The homepage and blog share the light/dark choice via `localStorage('theme')` and use cross-document view transitions (`view-transition-name: sky` and `site-top`).
- English is the focus. Japanese and German exist only as blog translations for now.
