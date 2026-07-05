/** Prisma returns `Decimal` for numeric columns; this coerces any of those (or plain numbers/strings) safely. */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}
