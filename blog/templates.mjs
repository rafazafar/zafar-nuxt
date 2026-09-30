// HTML for the blog. Plain template strings, no framework.
// The look matches public/index.html: same tokens, fonts, top bar and footer.

export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const SITE = 'https://zafar.dev'
const RESUME = 'https://docs.google.com/document/d/e/2PACX-1vTqFnfyHNvn48h_-v__nIAxO77b1cJLzTVT_O5cpRvjzDlYLy6bwhQZcagAiF5dXc21eblTIPVgJy6y/pub'
const MEETING = 'https://cal.com/zafar'
const DEFAULT_OG = `${SITE}/home/profile.jpg`
const FONTS = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700&family=Shantell+Sans:wght@400;600&family=Atkinson+Hyperlegible+Next:wght@400;700&display=swap'

// Runs in <head> before first paint so a theme picked on another page sticks (shared with public/index.html).
const THEME_BOOT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

// The homepage hero is a live sky over Tokyo. The blog keeps a thin strip of the same sky,
// coloured by the current Tokyo hour, so the two pages flow into each other.
const SKY = `(()=>{const P=[[0,'#070d26','#1b2350',1],[4.5,'#101a45','#3a3f74',.9],[5.6,'#34407e','#f2a58e',.55],[7,'#78c1ee','#e6f5ff',0],[15,'#5fb2e6','#d4eeff',0],[17,'#ea7f5a','#ffd79c',.2],[18.6,'#3a2d6b','#e1768c',.65],[20,'#0c1434','#2a3264',1],[24,'#070d26','#1b2350',1]];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(a,b,t)=>'rgb('+rgb(a).map((v,i)=>Math.round(v+(rgb(b)[i]-v)*t)).join(',')+')';
const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
const h=+p.find(x=>x.type==='hour').value+p.find(x=>x.type==='minute').value/60;let i=0;while(P[i+1][0]<=h)i++;
const a=P[i],b=P[i+1],t=(h-a[0])/(b[0]-a[0]),m=document.getElementById('top');
m.style.setProperty('--sky-top',mix(a[1],b[1],t));m.style.setProperty('--sky-bot',mix(a[2],b[2],t));m.classList.toggle('is-night',a[3]+(b[3]-a[3])*t>.5)})()`

const LAMP_JS = `(()=>{const l=document.getElementById('lamp'),r=document.documentElement;
const dark=()=>r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
const sync=()=>l.setAttribute('aria-pressed',String(dark()));
l.addEventListener('click',()=>{r.dataset.theme=dark()?'light':'dark';try{localStorage.setItem('theme',r.dataset.theme)}catch(e){}sync()});sync()})()`

const SIGNATURE = '<svg viewBox="0 0 110 34" role="img" aria-label="Zafar\'s signature"><path d="M4 8 h20 l-18 18 h22 M34 24 c-5 -6 5 -11 6 -3 c1 3 2 5 4 3 M50 26 c3 -8 5 -17 9 -18 c2 0 -2 8 -6 9 h8 M62 24 c-5 -6 5 -11 6 -3 c1 3 2 5 4 3 M76 26 c2 -6 3 -8 8 -8 M86 22 c8 2 14 -1 20 -8"/></svg>'

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
  return `<div class="masthead" id="top">
  <div class="sky" aria-hidden="true"></div>
  <header class="top">
    <a class="sig" href="${s.home}">zafar ✎</a>
    <nav class="top-r">
      <a href="${RESUME}" target="_blank" rel="noopener">${s.resume}</a>
      <a href="${blogPath}"${isIndex ? ' aria-current="page"' : ''}>${s.blog}</a>
      <a href="/#hello">${s.sayHi}</a>
      <button class="lamp" id="lamp" type="button" aria-label="${s.lamp}" aria-pressed="false">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 a5.5 5.5 0 0 1 3 10 v2 h-6 v-2 a5.5 5.5 0 0 1 3 -10 z M8 17 h4"/></svg>
      </button>
    </nav>
  </header>
</div>
<script>${SKY}</script>`
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
    ${SIGNATURE}
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
    <span class="tape"></span>
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
      <span class="tape"></span>
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
