export const processEnum = (data: unknown, fallback: string[]): string[] => {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
    return data as string[]
  }

  const raw = Array.isArray(data) ? data[0] : data
  if (typeof raw === 'string' && raw !== '') {
    return raw.replace(/{|}/g, '').split(',')
  }

  return fallback
}