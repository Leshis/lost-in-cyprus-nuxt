export const processEnum = (data: unknown, fallback: string[]): string[] => {
  // New format: proper JS array of strings (from text[] return type)
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
    return data as string[]
  }

  // Old format: [{get_enum_values: '{hiking,food,...}'}] — single Postgres string
  const raw = Array.isArray(data) ? data[0] : data
  if (typeof raw === 'string' && raw !== '') {
    return raw.replace(/{|}/g, '').split(',')
  }

  return fallback
}

export const buildPostgisPoint = (lat: number | null, long: number | null): string => {
  return `POINT(${long} ${lat})`
}