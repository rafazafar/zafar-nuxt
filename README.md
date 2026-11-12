# zafar.dev

Static files, served by Cloudflare. No framework.

```
public/            everything that gets served
  index.html       the homepage, written by hand (live Tokyo sky, photo pile, …)
  home/            homepage images
  blog/ ja/blog/ de/blog/ 404.html   generated from blog/, don't edit
  _redirects       old URLs from the Nuxt site → homepage / blogs
blog/              the blog: Markdown posts + the small generator (see blog/README.md)
party/             separate Worker that syncs the homepage photo pile between visitors
wrangler.jsonc     deploys public/ as static assets
```

## Commands

```bash
bun install
bun dev            # rebuilds the blog on save and serves public/ at localhost:8787
bun run build      # generate the blog
bun run deploy     # build + wrangler deploy
bun run lint
```

Cloudflare's Git integration runs `bun run build`, then `npx wrangler deploy`.

To add a blog post, drop a Markdown file in `blog/posts/en/`. Details in `blog/README.md`.
