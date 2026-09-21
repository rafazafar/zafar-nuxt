export type ServiceLink = {
  label: string
  path: string
}

export type ServiceFaq = {
  label: string
  content: string
}

export type ServiceList = {
  title: string
  items: string[]
}

export type ServicePage = {
  seo: {
    title: string
    description: string
  }
  title: string
  hero: {
    description: string
    supporting: string
    related?: ServiceLink
    supportingAfter?: string
  }
  audience: {
    title: string
    fit: ServiceList
    notFit: ServiceList
  }
  gap: {
    title: string
    paragraphs: string[]
  }
  deliverables: {
    title: string
    intro?: string
    items: {
      title: string
      description: string
    }[]
  }
  process: {
    title: string
    intro?: string
    items: {
      title: string
      description: string
    }[]
    note?: string
  }
  controls?: {
    title: string
    intro: string
    rows: {
      label: string
      design: string
    }[]
    note: string
  }
  pair?: {
    title: string
    intro: string
    prefix: string
    related: ServiceLink
    suffix: string
  }
  proof: {
    title: string
    body: string
  }
  faq: ServiceFaq[]
  closing: {
    title: string
    description: string
    firstCall: string
    related?: {
      prefix: string
      link: ServiceLink
      suffix: string
    }
  }
}

export const services: Record<'aiSystems' | 'productCraft', ServicePage> = {
  aiSystems: {
    seo: {
      title: 'Enterprise AI with real safety controls | Zafar',
      description: 'Production AI agents and features with human gates, allowlists, and audit logs — designed toward NIST AI RMF and EU AI Act concepts. One partner who wrangles the AI and ships the product.'
    },
    title: 'AI wrangling with enterprise-level safety',
    hero: {
      description: 'You need agents or AI features in production — with human gates, allowlists, and an audit trail — not another chatbot demo.',
      supporting: 'I’m a one-stop digital factory: I wrangle the AI and ship the product around it.'
    },
    audience: {
      title: 'Who this is for / not for',
      fit: {
        title: 'A fit if you:',
        items: [
          'Need AI in a real workflow (ops, IT, product) where a wrong tool call has consequences',
          'Care about human approval, least privilege, and logs you can actually replay',
          'Want one partner who can design the product and bound the model — not four vendors to coordinate'
        ]
      },
      notFit: {
        title: 'Not a fit if you:',
        items: [
          'Want a prototype chatbot or a prompt playground with no production path',
          'Want unattended agents on production data with no human gate'
        ]
      }
    },
    gap: {
      title: 'The gap: demo AI → production AI',
      paragraphs: [
        'Demos forgive mistakes. Production doesn’t.',
        'Without controls, agents can call the wrong tools, pull the wrong data, quietly break policy, and leave you with no trail to explain what happened.',
        'The gap isn’t “smarter models.” It’s bounds, approvals, evidence, and a product someone on your team can own after handoff.'
      ]
    },
    deliverables: {
      title: 'What you get',
      intro: 'Four concrete deliverables — not a slide deck of buzzwords:',
      items: [
        {
          title: 'Human-in-the-loop gates',
          description: 'High-risk actions wait for a person. Low-risk steps can run; the line is explicit.'
        },
        {
          title: 'Tool and data allowlists',
          description: 'The agent only touches what you named. Everything else is out of reach by default.'
        },
        {
          title: 'Audit logs and replay',
          description: 'Prompts, tool calls, and decisions in a trail you can export and review.'
        },
        {
          title: 'Policy + eval harness before ship',
          description: 'Soak and eval against abuse cases (including prompt injection and data leakage) before it hits real users.'
        }
      ]
    },
    process: {
      title: 'How an engagement runs',
      intro: 'Builder process, not agency waterfall:',
      items: [
        {
          title: 'Discover risks',
          description: 'Where the AI sits, what it can touch, what “bad” looks like for your team.'
        },
        {
          title: 'Threat and control map',
          description: 'Gates, allowlists, logging, and ownership — written down before we scale the happy path.'
        },
        {
          title: 'Build with guards',
          description: 'Product + agent/workflows with controls in from sprint one, not bolted on after a scare.'
        },
        {
          title: 'Prove with soak and evals',
          description: 'Exercise failure modes; fix what breaks before you call it done.'
        },
        {
          title: 'Handoff runbooks',
          description: 'Who can change prompts, tools, and policy — and how you operate it without me in the loop.'
        }
      ]
    },
    controls: {
      title: 'Controls language, plain and careful',
      intro: 'Buyer words map to design patterns we implement, not certificates I claim to hold:',
      rows: [
        {
          label: 'Human-in-the-loop',
          design: 'Approval gates on high-risk actions'
        },
        {
          label: 'Least privilege',
          design: 'Tool/data allowlists; no ambient access'
        },
        {
          label: 'Auditability',
          design: 'Exportable logs of prompts, tools, decisions'
        },
        {
          label: '“SOC 2–ish” discipline',
          design: 'Change ownership, review habits, evidence trails — process, not a seal'
        },
        {
          label: 'NIST AI RMF / EU AI Act',
          design: 'Work designed toward those concepts (risk, oversight, transparency, documentation) — not a claim that you or I are certified'
        }
      ],
      note: 'I do not put SOC 2, ISO, or EU AI Act badges on this site. If your program needs a formal certification path, we design the system so that path is easier — we don’t fake the paperwork.'
    },
    proof: {
      title: 'Proof',
      body: 'Proof strip intentionally empty until there is real, anonymized AI/safety engagement proof to show. Existing client notes on the site (Suzuki, Ueda, Hidayat) speak to how I work under pressure. They are not safety or compliance case studies, so they do not live in this strip. When we have a real anonymized example, it goes here. Empty is better than invented logos.'
    },
    faq: [
      {
        label: 'Do you make us “EU AI Act compliant”?',
        content: 'No. I don’t sell certification. I design systems toward EU AI Act and NIST AI RMF concepts — oversight, transparency, bounded behavior, documentation — so your compliance process has something real to work with. Legal sign-off stays with you and your counsel.'
      },
      {
        label: 'Can you work in our VPC / private cloud?',
        content: 'Yes — private deployment and least-privilege access are normal for this kind of work. Exact hosting is decided in scoping from your constraints.'
      },
      {
        label: 'Who owns the model and the IP?',
        content: 'You do, unless we agree otherwise in writing. Prompts, policies, allowlists, and application code are yours at handoff.'
      },
      {
        label: 'What won’t you automate?',
        content: 'Anything that can move money, change access, delete data, or contact customers without a human gate — unless you explicitly accept that risk in writing and we design for it. Default is: high-impact actions need a person.'
      },
      {
        label: 'How is this different from hiring an AI agency?',
        content: 'Agencies often ship a demo and leave the product, controls, and ownership as your problem. I wrangle the AI and ship the product around it — one partner, controls in from the start, runbooks at handoff.'
      },
      {
        label: 'What’s the timeline?',
        content: 'Depends on risk surface and integrations. Enterprise control work is scoped honestly; I don’t promise “1–2 week MVP” on this page. First call is for a realistic shape, not a fake date.'
      },
      {
        label: 'What do you need from us to start?',
        content: 'A real use case, who owns risk internally, where the data lives, and which systems the agent must (and must not) touch. A sandbox helps; a blank “build us AI” brief doesn’t.'
      },
      {
        label: 'Do you only do the model layer, or the product too?',
        content: 'Both. UI, workflows, integrations, and the agent bounds are one build. If you only want prompts with no product, I’m the wrong hire.'
      },
      {
        label: 'How does handoff work?',
        content: 'You get the system, the control map, logs/eval setup, and a runbook for who changes what. Goal: your team can operate and extend it without me as a single point of failure.'
      }
    ],
    closing: {
      title: 'Past the demo?',
      description: 'If you’re past the demo and need production AI with real bounds, let’s map the risks and the first controlled slice.',
      firstCall: 'the use case, what must never be automated, where data lives, and whether a bounded pilot is even the right next step.',
      related: {
        prefix: 'When live: also see',
        link: {
          label: 'Product craft',
          path: '/services/product-craft'
        },
        suffix: ' — the other half of the digital factory.'
      }
    }
  },
  productCraft: {
    seo: {
      title: 'Product craft that feels human — and ships | Zafar',
      description: 'Bespoke product UI, interaction, and build-ready design — taste without agency theater. One digital factory with AI systems when you need controls too.'
    },
    title: 'Product craft people can feel',
    hero: {
      description: 'Interfaces that earn trust — clear hierarchy, restrained motion, voice in the layout — designed and shipped with the product, not thrown over a wall.',
      supporting: 'I’m a one-stop digital factory. This pillar is taste and interaction. The other is',
      related: {
        label: 'AI systems with real controls',
        path: '/services/ai-systems'
      },
      supportingAfter: '.'
    },
    audience: {
      title: 'Who this is for / not for',
      fit: {
        title: 'A fit if you:',
        items: [
          'Are building zero-to-one and need the product to feel considered from the first real users',
          'Are redesigning something that “works” but feels rented — template SaaS, AI-slop screens, enterprise gray',
          'Want enterprise tools that shouldn’t feel like enterprise tools',
          'Want design judgment paired with someone who can also build (or hand engineers specs that survive contact with code)'
        ]
      },
      notFit: {
        title: 'Not a fit if you:',
        items: [
          'Need a logo, brand deck, or campaign with no product attached',
          'Want “make it pop” with no product owner and no constraints'
        ]
      }
    },
    gap: {
      title: 'The gap',
      paragraphs: [
        'Template kits and AI-generated UI get you to “looks like an app” fast. Users still bounce when it feels empty: wrong hierarchy, limp states, copy that doesn’t match the pixels, motion that distracts instead of guides.',
        'Stakes: trust, retention, and the quiet failure mode — looks done, feels hollow.',
        'The gap isn’t more screens. It’s judgment in the product — what to delete, what to emphasize, and how it behaves when things go wrong.'
      ]
    },
    deliverables: {
      title: 'What you get',
      items: [
        {
          title: 'Product UI systems',
          description: 'Components and states, not one-off mocks. Patterns that scale as the product grows.'
        },
        {
          title: 'Interaction and motion with restraint',
          description: 'Feedback that teaches; no decorative noise.'
        },
        {
          title: 'Content and layout pairing',
          description: 'Voice in the pixels. Labels, empty states, and hierarchy written with the UI, not pasted later.'
        },
        {
          title: 'Build-ready specs',
          description: 'For your eng team: decisions, states, and edge cases written down so handoff doesn’t invent the product.'
        },
        {
          title: 'Shippable UI',
          description: 'Design that is meant to land in production — or paired build from the same factory — not a Dribbble graveyard.'
        }
      ]
    },
    process: {
      title: 'How we work',
      items: [
        {
          title: 'Taste + constraints',
          description: 'Users, brand limits, tech stack, what “done” means.'
        },
        {
          title: 'Flows and IA',
          description: 'Paths, not pretty dead-ends.'
        },
        {
          title: 'High-fi craft',
          description: 'Hierarchy, type, components, states.'
        },
        {
          title: 'Prototype / validate',
          description: 'Pressure-test with real tasks before you pour concrete.'
        },
        {
          title: 'Handoff to build',
          description: 'Specs, assets, and decisions written down — or I stay through implementation.'
        }
      ],
      note: 'Working rules: first principles over trend decks; delete before decorate; ego-free critique; iterate in the product, not endless slides; polish that ships beats perfect that waits.'
    },
    pair: {
      title: 'Pair with AI systems',
      intro: 'If the product includes agents or AI features, craft and controls belong together. Pretty chat that can call the wrong tools is still a liability.',
      prefix: 'Same digital factory:',
      related: {
        label: 'AI systems with enterprise-level safety',
        path: '/services/ai-systems'
      },
      suffix: ' for gates, allowlists, audit trails, and evals — beside the UI people actually trust.'
    },
    proof: {
      title: 'Proof',
      body: 'Proof strip empty on purpose. When we add shots, they’ll be real product work with accurate role labels (PM / design / build) and Zafar’s OK — not invented case studies or award badges. Soft testimonials elsewhere on the site are reputation, not craft proof, so they don’t live here.'
    },
    faq: [
      {
        label: 'Design-only or design + build?',
        content: 'Either. Some teams want craft and specs for their eng. Others want the same partner through ship. We pick on the first call from your constraints — not a package upsell.'
      },
      {
        label: 'What does “bespoke” actually mean here?',
        content: 'Built for your users and constraints — not a theme with your logo swapped in, and not a concept that can’t be engineered. It does not mean endless custom ornament.'
      },
      {
        label: 'How fast can this move?',
        content: 'A focused slice (core flows + a coherent UI system start) can move in weeks when scope is honest. Deep polish across a large surface takes longer. I won’t sell “world-class UX in five days.”'
      },
      {
        label: 'How does feedback work?',
        content: 'Short loops in the product (or prototype), not 40-page PDF comment wars. You own product calls; I push on taste and clarity without ego.'
      },
      {
        label: 'Startup taste vs enterprise taste?',
        content: 'Same craft standard, different constraints. Enterprise tools can still feel human — that’s often the point of this pillar. We don’t paste a consumer skin on a workflow that needs density and speed.'
      },
      {
        label: 'How is this different from a design agency?',
        content: 'Agencies optimize for decks and handoff theater. I optimize for what ships and what users feel. The same factory can also wrangle AI with production controls when the product needs that too.'
      },
      {
        label: 'What do you need to start?',
        content: 'Who it’s for, the job the product must do, hard constraints (brand, stack, compliance), and examples of “feels right” / “feels wrong” — even if they’re competitors.'
      }
    ],
    closing: {
      title: 'Make the product feel intentional.',
      description: 'If the product works but doesn’t feel like anyone meant it, let’s map constraints, users, and what “done” looks like.',
      firstCall: 'users and jobs-to-be-done, taste references, technical constraints, and whether design-only or design+build is the right shape.',
      related: {
        prefix: 'Also:',
        link: {
          label: 'AI systems with enterprise-level safety',
          path: '/services/ai-systems'
        },
        suffix: '.'
      }
    }
  }
}
