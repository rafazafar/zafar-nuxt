// Site content: the YAML files in content/<locale>/, bundled at build time.
// No database, no queries. Edit the YAML and rebuild.
// (.yml imports are turned into plain objects by the small Vite plugin in nuxt.config.ts)
import { marked } from 'marked'

export type Locale = 'en' | 'ja' | 'de'

export interface Button {
  label: string
  icon?: string
  to?: string
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'solid' | 'outline' | 'subtle' | 'soft' | 'ghost' | 'link'
  target?: '_blank' | '_self'
}

export interface Image {
  src: string
  alt: string
  link?: string
  caption?: string
}

export interface Author {
  name: string
  description?: string
  username?: string
  twitter?: string
  to?: string
  avatar?: { src: string, alt: string }
}

interface Seo {
  seo?: { title?: string, description?: string }
}

export interface IndexPage extends Seo {
  title: string
  description: string
  hero: { links: Button[], images: Image[] }
  about: { title: string, description: string }
  experience: {
    title: string
    description?: string
    items: { date: string, position: string, company: { name: string, url: string, logo: string, color: string } }[]
  }
  testimonials: { quote: string, author: Author }[]
  blog: { title: string, description: string }
  faq: {
    title: string
    description: string
    categories: { title: string, questions: { label: string, content: string }[] }[]
  }
}

export interface AboutPage extends Seo {
  title: string
  description: string
  content: string
  images: Image[]
}

export interface SpeakingPage extends Seo {
  title: string
  description: string
  links: Button[]
  events: { category: 'Live talk' | 'Podcast' | 'Conference', title: string, date: string, location: string, url?: string }[]
}

export interface ProjectsPage extends Seo {
  title: string
  description: string
  links?: Button[]
}

export interface Project {
  path: string
  title: string
  description: string
  image: string
  url: string
  tags: string[]
  date: string
  alt?: string
}

interface Pages {
  index: IndexPage
  about: AboutPage
  speaking: SpeakingPage
  projects: ProjectsPage
}

const files = import.meta.glob<Record<string, unknown>>('../../content/**/*.yml', { eager: true, import: 'default' })
const file = (locale: string, name: string) => files[`../../content/${locale}/${name}.yml`]

/** A page's content in the given locale, falling back to English. */
export function getPage<K extends keyof Pages>(locale: string, name: K): Pages[K] {
  return (file(locale, name) ?? file('en', name)) as unknown as Pages[K]
}

/** Every project in content/<locale>/projects/, newest first. */
export function getProjects(locale: string): Project[] {
  const prefix = `../../content/${files[`../../content/${locale}/projects.yml`] ? locale : 'en'}/projects/`
  return Object.entries(files)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, data]) => ({ ...data, path: `/projects/${path.slice(prefix.length).replace(/\.yml$/, '')}` }) as Project)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

/** Short Markdown (paragraphs, links, emphasis) from the YAML files, as HTML. */
export function renderMarkdown(text: string | undefined): string {
  return text ? marked.parse(text, { async: false }) : ''
}
