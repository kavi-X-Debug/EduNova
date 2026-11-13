export const controlCls =
  'min-h-[44px] w-full rounded-md border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-faint outline-none transition-colors duration-fast ease-standard focus-visible:shadow-focus disabled:bg-surface-sunken disabled:opacity-60';
export const controlBorder = (invalid: boolean) => (invalid ? 'border-danger-500' : 'border-line-strong hover:border-ink-faint');
