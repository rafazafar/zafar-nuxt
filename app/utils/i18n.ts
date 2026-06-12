export function stripLocaleFromPath(path: string, locale: string) {
  if (locale === 'en') {
    return path
  }

  const prefix = `/${locale}`
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length) || '/'
  }

  return path
}