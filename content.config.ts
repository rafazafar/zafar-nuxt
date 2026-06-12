import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const buttonSchema = z.object({
  label: z.string(),
  icon: z.string().optional(),
  to: z.string().optional(),
  color: z.enum(['primary', 'neutral', 'success', 'warning', 'error', 'info']).optional(),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional(),
  target: z.enum(['_blank', '_self']).optional()
})

const imageSchema = z.object({
  src: z.string().editor({ input: 'media' }),
  alt: z.string(),
  link: z.string().optional()
})

const authorSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  username: z.string().optional(),
  twitter: z.string().optional(),
  to: z.string().optional(),
  avatar: z.object({
    src: z.string().editor({ input: 'media' }),
    alt: z.string()
  }).optional()
})

const testimonialSchema = z.object({
  quote: z.string(),
  author: authorSchema
})

const indexSchema = z.object({
  title: z.string(),
  description: z.string(),
  hero: z.object({
    links: z.array(buttonSchema),
    images: z.array(imageSchema)
  }),
  about: z.object({
    title: z.string(),
    description: z.string()
  }),
  experience: z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(z.object({
      date: z.string(),
      position: z.string(),
      company: z.object({
        name: z.string(),
        url: z.string(),
        logo: z.string().editor({ input: 'icon' }),
        color: z.string()
      })
    }))
  }),
  testimonials: z.array(testimonialSchema),
  blog: z.object({
    title: z.string(),
    description: z.string()
  }),
  faq: z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(
      z.object({
        title: z.string().nonempty(),
        questions: z.array(
          z.object({
            label: z.string().nonempty(),
            content: z.string().nonempty()
          })
        )
      }))
  })
})

const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  minRead: z.number(),
  date: z.date(),
  image: z.string().nonempty().editor({ input: 'media' }),
  author: authorSchema
})

const projectSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  image: z.string().nonempty().editor({ input: 'media' }),
  url: z.string().nonempty(),
  tags: z.array(z.string()),
  date: z.date(),
  alt: z.string().optional()
})

const speakingSchema = z.object({
  title: z.string(),
  description: z.string(),
  links: z.array(buttonSchema),
  events: z.array(z.object({
    category: z.enum(['Live talk', 'Podcast', 'Conference']),
    title: z.string(),
    date: z.date(),
    location: z.string(),
    url: z.string().optional()
  }))
})

const aboutSchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string(),
  images: z.array(imageSchema)
})

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: { include: 'en/blog/**', prefix: '/blog' },
      schema: blogPostSchema
    }),
    blog_de: defineCollection({
      type: 'page',
      source: { include: 'de/blog/**', prefix: '/blog' },
      schema: blogPostSchema
    }),
    blog_ja: defineCollection({
      type: 'page',
      source: { include: 'ja/blog/**', prefix: '/blog' },
      schema: blogPostSchema
    }),
    projects: defineCollection({
      type: 'page',
      source: { include: 'en/projects/**', prefix: '/projects' },
      schema: projectSchema
    }),
    projects_de: defineCollection({
      type: 'page',
      source: { include: 'de/projects/**', prefix: '/projects' },
      schema: projectSchema
    }),
    projects_ja: defineCollection({
      type: 'page',
      source: { include: 'ja/projects/**', prefix: '/projects' },
      schema: projectSchema
    }),
    speaking: defineCollection({
      type: 'page',
      source: { include: 'en/speaking.yml', prefix: '/speaking' },
      schema: speakingSchema
    }),
    speaking_de: defineCollection({
      type: 'page',
      source: { include: 'de/speaking.yml', prefix: '/speaking' },
      schema: speakingSchema
    }),
    speaking_ja: defineCollection({
      type: 'page',
      source: { include: 'ja/speaking.yml', prefix: '/speaking' },
      schema: speakingSchema
    }),
    about: defineCollection({
      type: 'page',
      source: { include: 'en/about.yml', prefix: '/about' },
      schema: aboutSchema
    }),
    about_de: defineCollection({
      type: 'page',
      source: { include: 'de/about.yml', prefix: '/about' },
      schema: aboutSchema
    }),
    about_ja: defineCollection({
      type: 'page',
      source: { include: 'ja/about.yml', prefix: '/about' },
      schema: aboutSchema
    }),
    content_en: defineCollection({
      type: 'page',
      source: { include: 'en/index.yml', prefix: '' },
      schema: indexSchema
    }),
    content_de: defineCollection({
      type: 'page',
      source: { include: 'de/index.yml', prefix: '' },
      schema: indexSchema
    }),
    content_ja: defineCollection({
      type: 'page',
      source: { include: 'ja/index.yml', prefix: '' },
      schema: indexSchema
    })
  }
})
