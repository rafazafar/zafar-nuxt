// @ts-check
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default [
  { ignores: ['node_modules', 'public', '.wrangler', '.cloudflare', 'party'] },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
    plugins: { '@stylistic': stylistic },
    rules: {
      // same style as before: 2 spaces, single quotes, no semicolons, no trailing commas, 1tbs braces
      ...stylistic.configs.customize({ commaDangle: 'never', braceStyle: '1tbs' }).rules,
      'no-undef': 'error',
      'no-unused-vars': 'warn'
    }
  }
]
