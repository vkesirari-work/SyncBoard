export function resolveServiceUrl({ configured, isLocal, localFallback, name }) {
  const explicitUrl = configured?.trim()
  if (explicitUrl) return explicitUrl.replace(/\/$/, '')
  if (isLocal) return localFallback
  throw new Error(`${name} is not configured for this deployment`)
}
