#!/usr/bin/env node
// Builds the static blog from blog/posts/<lang>/*.md.
//
//   bun run blog          build once
//   bun run blog:watch    rebuild whenever something in blog/ changes
//
// Writes:
//   public/blog/**, public/ja/blog/**, public/de/blog/**   (generated, don't edit by hand)
//   app/data/blog-latest.json                             (latest posts for the ja/de Nuxt homepages)

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'
import { createHighlighter } from 'shiki'
import { parse as parseYaml } from 'yaml'
import { LANGS, DEFAULT_LANG } from './strings.mjs'
import { indexPage, postPage, esc } from './templates.mjs'

const BLOG = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(BLOG, '..')
const PUBLIC = path.join(ROOT, 'public')
const LATEST_JSON = path.join(ROOT, 'app/data/blog-latest.json')

const blogPath = lang => (lang === DEFAULT_LANG ? '/blog/' : `/${lang}/blog/`)
const outDir = lang => path.join(PUBLIC, ...blogPath(lang).split('/').filter(Boolean))

const CODE_LANGS = ['ts', 'tsx', 'js', 'jsx', 'json', 'jsonc', 'vue', 'html', 'css', 'bash', 'shell', 'yaml', 'markdown', 'swift', 'kotlin', 'python', 'sql', 'diff']
const highlighter = await createHighlighter({ themes: ['github-light', 'github-dark'], langs: CODE_LANGS })
const LANG_ALIAS = { javascript: 'js', typescript: 'ts', sh: 'bash', zsh: 'bash', md: 'markdown', yml: 'yaml', py: 'python' }

const slugify = text => text.toLowerCase().normalize('NFKC')
  .replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section'

function markdown(src) {
  const ids = new Map()
  const md = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        // the page title is the only h1, so body headings start at h2
        const level = Math.max(depth, 2)
        const text = this.parser.parseInline(tokens)
        let id = slugify(text)
        const n = ids.get(id) || 0
        ids.set(id, n + 1)
        if (n) id += `-${n}`
        return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${text}</h${level}>\n`
      },
      code({ text, lang }) {
        const want = (lang || '').trim().split(/\s+/)[0].toLowerCase()
        const l = LANG_ALIAS[want] || want
        if (CODE_LANGS.includes(l)) {
          return highlighter.codeToHtml(text, { lang: l, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false }) + '\n'
        }
        return `<pre class="shiki"><code>${esc(text)}</code></pre>\n`
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const external = /^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?zafar\.dev/.test(href)
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`
      },
      image({ href, title, text }) {
        return `<img src="${esc(href)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`
      },
      table(token) {
        return `<div class="table">${this.constructor.prototype.table.call(this, token)}</div>\n`
      }
    }
  })
  return md.parse(src)
}

function readingTime(body, lang) {
  const text = body.replace(/```[\s\S]*?```/g, ' ')
  const minutes = lang === 'ja'
    ? text.replace(/\s/g, '').length / 500
    : text.split(/\s+/).filter(Boolean).length / 220
  return Math.max(1, Math.round(minutes))
}

function readPosts(lang) {
  const dir = path.join(BLOG, 'posts', lang)
  if (!fs.existsSync(dir)) return []
  const locale = lang === 'en' ? 'en-US' : lang
  const long = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
  const short = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' })

  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map((file) => {
    const where = `blog/posts/${lang}/${file}`
    const slug = file.replace(/\.md$/, '')
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`${where}: file names must be lowercase-with-dashes`)

    const src = fs.readFileSync(path.join(dir, file), 'utf8')
    const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!m) throw new Error(`${where}: missing the --- frontmatter --- block at the top`)
    const fm = parseYaml(m[1]) || {}
    for (const key of ['title', 'description', 'date']) {
      if (!fm[key]) throw new Error(`${where}: frontmatter needs "${key}"`)
    }
    const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${where}: date must look like 2026-09-30`)
    const d = new Date(`${date}T00:00:00Z`)

    return {
      slug, lang, date,
      draft: fm.draft === true,
      title: String(fm.title),
      description: String(fm.description),
      image: fm.image || '',
      imageAlt: fm.imageAlt || '',
      minRead: Number(fm.minRead) || readingTime(m[2], lang),
      dateLong: long.format(d),
      dateShort: short.format(d),
      path: `${blogPath(lang)}${slug}/`,
      html: markdown(m[2])
    }
  })
    .filter(p => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

export function build() {
  const t0 = Date.now()
  const langs = Object.keys(LANGS)
  const all = Object.fromEntries(langs.map(l => [l, readPosts(l)]))

  // one stylesheet for every language, cache-busted by content
  const cssSrc = fs.readFileSync(path.join(BLOG, 'blog.css'), 'utf8')
  const css = `/blog/blog.css?v=${crypto.createHash('sha1').update(cssSrc).digest('hex').slice(0, 8)}`

  for (const lang of langs) fs.rmSync(outDir(lang), { recursive: true, force: true })
  write(path.join(outDir(DEFAULT_LANG), 'blog.css'), cssSrc)

  const withPosts = langs.filter(l => all[l].length)
  const indexAlternates = withPosts.map(l => ({ lang: l, name: LANGS[l].name, path: blogPath(l) }))
  let count = 0

  for (const lang of withPosts) {
    const s = LANGS[lang]
    const posts = all[lang]
    write(path.join(outDir(lang), 'index.html'), indexPage({ lang, s, posts, blogPath: blogPath(lang), css, alternates: indexAlternates }))

    posts.forEach((post, i) => {
      const alternates = withPosts
        .map(l => all[l].find(p => p.slug === post.slug))
        .filter(Boolean)
        .map(p => ({ lang: p.lang, name: LANGS[p.lang].name, path: p.path }))
      const html = postPage({
        lang, s, post, css,
        newer: posts[i - 1],
        older: posts[i + 1],
        blogPath: blogPath(lang),
        alternates: alternates.length > 1 ? alternates : []
      })
      write(path.join(outDir(lang), post.slug, 'index.html'), html)
      count++
    })
  }

  const latest = Object.fromEntries(withPosts.map(l => [l, all[l].slice(0, 3).map(p => ({
    title: p.title, description: p.description, date: p.date, image: p.image, minRead: p.minRead, path: p.path
  }))]))
  write(LATEST_JSON, JSON.stringify(latest, null, 2) + '\n')

  console.log(`blog: ${count} posts (${withPosts.map(l => `${l} ${all[l].length}`).join(', ')}) in ${Date.now() - t0}ms`)
}

build()

if (process.argv.includes('--watch')) {
  let timer
  console.log('blog: watching blog/ for changes')
  fs.watch(BLOG, { recursive: true }, () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      try {
        // templates and strings are ES modules, so re-run in a fresh process to pick up edits to them too
        const { execFileSync } = await import('node:child_process')
        execFileSync(process.execPath, [fileURLToPath(import.meta.url)], { stdio: 'inherit' })
      } catch {
        // the child already printed the error; keep watching
      }
    }, 80)
  })
}
