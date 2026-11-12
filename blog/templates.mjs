// HTML for the blog. Plain template strings, no framework.
// The look matches public/index.html: same tokens, fonts, top bar and footer.

export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const SITE = 'https://zafar.dev'
const RESUME = 'https://docs.google.com/document/d/e/2PACX-1vTqFnfyHNvn48h_-v__nIAxO77b1cJLzTVT_O5cpRvjzDlYLy6bwhQZcagAiF5dXc21eblTIPVgJy6y/pub'
const MEETING = 'https://cal.com/zafar'
const DEFAULT_OG = `${SITE}/home/profile.jpg`
const FONTS = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700&family=Atkinson+Hyperlegible+Next:wght@400;700&family=JetBrains+Mono:wght@400;500;600&display=swap'

// Runs in <head> before first paint so a theme picked on another page sticks (shared with public/index.html).
const THEME_BOOT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

const LAMP_JS = `(()=>{const l=document.getElementById('lamp'),r=document.documentElement;
const dark=()=>r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
const sync=()=>l.setAttribute('aria-pressed',String(dark()));
l.addEventListener('click',()=>{r.dataset.theme=dark()?'light':'dark';try{localStorage.setItem('theme',r.dataset.theme)}catch(e){}sync()});sync()})()`

function head({ lang, title, description, canonical, image, type = 'website', alternates = [], published, css }) {
  const alt = alternates.map(a => `<link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.path}">`).join('\n')
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.ico">
<link rel="canonical" href="${SITE}${canonical}">
${alt}
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${canonical}">
<meta property="og:image" content="${esc(image || DEFAULT_OG)}">
${published ? `<meta property="article:published_time" content="${published}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${css}">
<script>${THEME_BOOT}</script>
</head>`
}

function masthead(s, blogPath, isIndex) {
  return `<div class="sheet" aria-hidden="true"></div>
<header class="top">
  <a class="sig" href="${s.home}">zafar<span class="cur">_</span></a>
  <nav class="top-r">
    <a class="wide" href="${RESUME}" target="_blank" rel="noopener">${s.resume}</a>
    <a href="${blogPath}"${isIndex ? ' aria-current="page"' : ''}>${s.blog}</a>
    <a href="/#hello">${s.sayHi}</a>
    <button class="lamp" id="lamp" type="button" aria-label="${s.lamp}" aria-pressed="false">
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 a5.5 5.5 0 0 1 3 10 v2 h-6 v-2 a5.5 5.5 0 0 1 3 -10 z M8 17 h4"/></svg>
    </button>
  </nav>
</header>`
}

function hello(s) {
  return `<section class="hello" aria-labelledby="hello-h">
    <span class="label">${s.turn}</span>
    <h2 id="hello-h">${s.next}</h2>
    <a class="btn" href="${MEETING}" target="_blank" rel="noopener">${s.cta}</a>
  </section>`
}

function footer(s, langLinks) {
  return `<footer>
    <span>${s.footer}</span>
    ${langLinks ? `<span class="langs">${langLinks}</span>` : ''}
  </footer>`
}

function shell({ s, blogPath, body, bodyClass, headArgs, langLinks }) {
  return `${head(headArgs)}
<body class="${bodyClass}">
${masthead(s, blogPath, bodyClass === 'is-index')}
<main class="page">
${body}
</main>
<div class="page page-end">
  ${hello(s)}
  ${footer(s, langLinks)}
</div>
<script>${LAMP_JS}</script>
</body>
</html>
`
}

const langLinksHtml = (s, links) => links.length
  ? `${s.alsoIn} ${links.map(l => `<a href="${l.path}" hreflang="${l.lang}" lang="${l.lang}">${l.name}</a>`).join(' · ')}`
  : ''

export function indexPage({ lang, s, posts, blogPath, css, alternates }) {
  const [latest, ...rest] = posts
  const byYear = new Map()
  for (const p of rest) {
    const y = p.date.slice(0, 4)
    if (!byYear.has(y)) byYear.set(y, [])
    byYear.get(y).push(p)
  }

  const featured = latest
    ? `<a class="featured${latest.image ? '' : ' no-img'}" href="${latest.path}">
    ${latest.image ? `<span class="f-img"><img src="${esc(latest.image)}" alt="${esc(latest.imageAlt)}"></span>` : ''}
    <span class="f-body">
      <span class="label">${s.latest} · <time datetime="${latest.date}">${latest.dateLong}</time></span>
      <span class="f-title">${esc(latest.title)}</span>
      <span class="f-desc">${esc(latest.description)}</span>
      <span class="f-more">${s.read} <span aria-hidden="true">→</span> <span class="f-min">${s.min(latest.minRead)}</span></span>
    </span>
  </a>`
    : ''

  const years = [...byYear].map(([year, list]) => `<section class="year" aria-labelledby="y-${year}">
    <h2 class="yr" id="y-${year}">${year}</h2>
    <ol class="rows">
${list.map(p => `      <li><a class="row" href="${p.path}">
        <time class="r-date" datetime="${p.date}">${p.dateShort}</time>
        <span class="r-main"><span class="r-title">${esc(p.title)}</span><span class="r-desc">${esc(p.description)}</span></span>
        <span class="r-min">${s.min(p.minRead)}</span>
      </a></li>`).join('\n')}
    </ol>
  </section>`).join('\n  ')

  const body = `  <section class="intro">
    <span class="label">${s.label}</span>
    <h1>${s.blogTitle}</h1>
    <p class="sub">${s.sub}</p>
  </section>
  ${featured}
  <div class="archive">
  ${years}
  </div>`

  return shell({
    s, blogPath, body, bodyClass: 'is-index',
    langLinks: langLinksHtml(s, alternates.filter(a => a.lang !== lang)),
    headArgs: {
      lang, css,
      title: `${s.blogTitle} | Zafar.dev`,
      description: s.metaDescription,
      canonical: blogPath,
      alternates
    }
  })
}

export function notFoundPage({ s, css, blogPath }) {
  const body = `  <section class="intro">
    <span class="label">404</span>
    <h1>Nothing here.</h1>
    <p class="sub">This page moved, or it never existed. Try <a href="/">the homepage</a> or <a href="${blogPath}">the notes</a>.</p>
  </section>`
  return shell({
    s, blogPath, body, bodyClass: 'is-404',
    headArgs: { lang: 'en', css, title: 'Not found | Zafar.dev', description: 'This page does not exist.', canonical: '/404' }
  })
}

export function postPage({ lang, s, post, newer, older, blogPath, css, alternates }) {
  const card = (p, dir) => p
    ? `<a class="pg pg-${dir}" href="${p.path}" rel="${dir === 'older' ? 'prev' : 'next'}">
      <span class="label">${dir === 'older' ? `← ${s.older}` : `${s.newer} →`}</span>
      <span class="pg-title">${esc(p.title)}</span>
    </a>`
    : '<span class="pg pg-empty" aria-hidden="true"></span>'

  const body = `  <a class="back" href="${blogPath}"><span aria-hidden="true">←</span> ${s.back}</a>
  <article class="post">
    <header class="post-head">
      <span class="label"><time datetime="${post.date}">${post.dateLong}</time> · ${s.minRead(post.minRead)}</span>
      <h1>${esc(post.title)}</h1>
      <p class="sub">${esc(post.description)}</p>
    </header>
    ${post.image
      ? `<figure class="cover">
      <img src="${esc(post.image)}" alt="${esc(post.imageAlt)}">
    </figure>`
      : ''}
    <div class="prose">
${post.html}
    </div>
  </article>
  ${older || newer
    ? `<nav class="pager" aria-label="More notes">
    ${card(older, 'older')}
    ${card(newer, 'newer')}
  </nav>`
    : ''}`

  return shell({
    s, blogPath, body, bodyClass: 'is-post',
    langLinks: langLinksHtml(s, alternates.filter(a => a.lang !== lang)),
    headArgs: {
      lang, css,
      title: `${post.title} | Zafar.dev`,
      description: post.description,
      canonical: post.path,
      image: post.image,
      type: 'article',
      published: post.date,
      alternates
    }
  })
}
