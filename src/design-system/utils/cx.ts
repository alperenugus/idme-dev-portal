export type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner — filters out falsy values. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
