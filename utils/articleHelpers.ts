export const processEnum = (data: unknown, fallback: string[]): string[] => {
  if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
    if (!data.some(item => (item as string).startsWith('{'))) {
      return data as string[]
    }
  }

  const raw = Array.isArray(data) ? data[0] : data
  if (typeof raw === 'string' && raw !== '') {
    return raw
      .replace(/[{}]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }

  return fallback
}
