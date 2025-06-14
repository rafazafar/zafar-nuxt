export default defineAppConfig({
  global: {
    picture: {
      dark: 'https://r2.zafar.dev/img/lei.png',
      light: 'https://r2.zafar.dev/img/profile.jpg',
      alt: 'My profile picture'
    },
    meetingLink: 'https://cal.com/zafar',
    email: 'hello@zafar.dev',
    available: true
  },
  ui: {
    colors: {
      primary: 'cyan',
      neutral: 'neutral'
    }
  },
  uiPro: {
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  },
  footer: {
    credits: `Copyright © Zafar`,
    colorMode: false,
    links: [
      {
      'icon': 'i-simple-icons-linkedin',
      'to': 'https://linkedin.com/in/rafazafar/',
      'target': '_blank',
      'aria-label': 'rafazafar on LinkedIn'
      },
      {
      'icon': 'i-simple-icons-x',
      'to': 'https://x.com/rafazafar',
      'target': '_blank',
      'aria-label': 'rafazafar on X'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/rafazafar',
      'target': '_blank',
      'aria-label': 'rafazafar on GitHub'
    }]
  }
})
