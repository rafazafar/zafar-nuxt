export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/javascript')
  setHeader(event, 'Service-Worker-Allowed', '/')
  return ''
})
