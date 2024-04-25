export function isDateString({ text }: { text: string }): boolean {
  const date = new Date(text);
  return !isNaN(date.getTime());
}
