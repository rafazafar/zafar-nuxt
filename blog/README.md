# The blog

Plain static HTML, generated from Markdown by one small script. No Nuxt, no database.
It uses the same look as the homepage (`public/index.html`).

```
blog/
  posts/en/*.md   English posts  → /blog/<file-name>/
  posts/ja/*.md   Japanese       → /ja/blog/<file-name>/
  posts/de/*.md   German         → /de/blog/<file-name>/
  build.mjs       Markdown → HTML
  templates.mjs   the page HTML (index + post)
  strings.mjs     UI text per language
  blog.css        styles (copied to public/blog/blog.css)
```

## Add a post

1. Create `blog/posts/en/my-new-post.md`. The file name becomes the URL.
2. Put this at the top, then write Markdown below it:

   ```md
   ---
   title: My new post
   description: One or two sentences for the list and for link previews.
   date: 2026-10-01
   image: https://…/cover.jpg   # optional
   ---

   First paragraph…

   ## A section
   ```

3. Run `bun run blog` (or `bun run blog:watch` while writing), then open `/blog/`.

`bun dev`, `bun run build` and `bun run deploy` all run the generator first, so you can't deploy a stale blog.

Optional frontmatter: `imageAlt`, `minRead` (worked out from the text if you leave it out), `tags`, and `draft: true` to keep a post out of the build.

A translation is the same file name under `posts/ja/` or `posts/de/`. Posts that share a file name link to each other automatically.

## Good to know

- `public/blog/`, `public/ja/blog/`, `public/de/blog/` and `app/data/blog-latest.json` are generated. Every build wipes and rewrites them, so edit the files in `blog/` instead.
- Don't write a `# Heading` at the top of a post. The title from the frontmatter is already the page's heading, so start sections at `##`.
- Code fences get syntax highlighting. The supported languages are listed in `CODE_LANGS` in `build.mjs`.
- The design tokens in `blog.css` are copied from `public/index.html`. When one changes, update the other.

## Article diagrams

Posts can contain a static HTML `<figure class="concept concept--flow">` with a
`concept-title`, an ordered list with class `concept-nodes`, and a `figcaption`.
Each list item contains a decorative SVG, a short label in `strong`, and an
explanation in `span`. Set `aria-hidden="true"` and `focusable="false"` on each
decorative SVG. Keep all explanations in visible text.

Use `flow` for a sequence, `timeline` for recorded events, `horizon` for time
comparisons, `layers` for a component structure, `board` for work states, and
`split` for separate responsibilities or alternatives. See the existing posts
for examples. Write labels and captions in the article's language.

The diagrams use the blog's theme colors and become a single column on small
screens. They need no client script or external image service. After editing,
run `bun run blog` and check the result at desktop and phone widths in both themes.
