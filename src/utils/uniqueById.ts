export function uniqueById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();

  return arr.filter(
    (item) => (seen.has(item.id) ? false : (seen.add(item.id), true)) // comma operator: Run the first, return the second
  );
}
