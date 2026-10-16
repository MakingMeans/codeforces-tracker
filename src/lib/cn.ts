/** Joins class names, skipping the falsy ones. */
export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')
