export function toId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
