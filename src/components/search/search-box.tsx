import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { cn } from '../../lib/cn'
import { cleanHandle, handleProblem } from '../../lib/handle'
import { navigate, type Route } from '../../lib/route'
import { buttonClass } from '../ui/button-class'

interface SearchBoxProps {
  /**
   * `hero` on the home page, `compact` in the top bar, `fix` where a handle was
   * not found: compact, with a visible button and no `/` shortcut.
   */
  variant: 'hero' | 'compact' | 'fix'
  /** The handle to start from, focused with the cursor at the end so it can be corrected. */
  initial?: string
  /** Where a valid handle leads; its profile by default. */
  to?: (handle: string) => Partial<Route>
  /** A handle that cannot be picked here, such as the other side of a comparison. */
  exclude?: string
  /** Accessible name of the field. */
  label?: string
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/** Handle search. Checks the handle before anything is sent to Codeforces; `/` focuses it from anywhere. */
export function SearchBox({ variant, initial = '', to, exclude, label = 'Codeforces handle' }: SearchBoxProps) {
  const [value, setValue] = useState(initial)
  const [problem, setProblem] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const hero = variant === 'hero'
  const fix = variant === 'fix'

  useEffect(() => {
    if (!fix) return
    const input = inputRef.current
    input?.focus()
    input?.setSelectionRange(input.value.length, input.value.length)
  }, [fix])

  useEffect(() => {
    if (fix) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fix])

  function submit(event: FormEvent) {
    event.preventDefault()
    const handle = cleanHandle(value)
    const found =
      handleProblem(value) ??
      (exclude && handle.toLowerCase() === exclude.toLowerCase() ? 'Pick someone else to compare with.' : null)
    setProblem(found)
    if (found) {
      inputRef.current?.focus()
      return
    }
    if (!fix) setValue('')
    inputRef.current?.blur()
    navigate(to ? to(handle) : { handle })
  }

  return (
    <form
      role="search"
      aria-label={fix ? 'Search again' : 'Players'}
      onSubmit={submit}
      noValidate
      className={cn('grid gap-2', hero ? 'max-w-[640px]' : 'w-full max-w-[420px]', fix && 'justify-self-stretch')}
    >
      <div
        className={cn(
          // The field's focus ring sits on the whole box, like every other focus outline on the page.
          'cut flex items-stretch [--cut-fill:var(--color-surface)] [--cut-line:var(--color-line-strong)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-ink has-[input:focus-visible]:[--cut-line:var(--color-ink)]',
          hero ? '[--cut:14px]' : '[--cut:10px]',
          problem && '[--cut-line:var(--color-accent)]',
        )}
      >
        <label htmlFor={`${id}-handle`} className="sr-only">
          {label}
        </label>
        <Search
          aria-hidden
          className={cn('shrink-0 self-center text-ink-muted', hero ? 'ml-4 h-5 w-5' : 'ml-3 h-4 w-4')}
        />
        <input
          ref={inputRef}
          id={`${id}-handle`}
          name="handle"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            if (problem) setProblem(null)
          }}
          placeholder={hero ? 'Codeforces handle, e.g. tourist' : 'Search a handle'}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-invalid={problem ? true : undefined}
          aria-describedby={`${id}-hint`}
          className={cn(
            'w-0 min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-muted focus-visible:outline-none',
            hero ? 'px-3 py-4 text-lg' : 'px-2.5 py-2 text-[15px]',
          )}
        />
        {hero ? (
          <button type="submit" className={buttonClass('primary', 'm-1.5 px-6')}>
            Search
          </button>
        ) : fix ? (
          <button type="submit" className={buttonClass('primary', 'm-1 px-4 py-1.5 text-[13px]')}>
            Search
          </button>
        ) : (
          <>
            <kbd
              aria-hidden
              className="mr-2 hidden self-center px-1.5 font-label text-xs font-bold text-ink-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] sm:block"
            >
              /
            </kbd>
            {/* Lets Enter submit; out of the tab order since it is never visible. */}
            <button type="submit" tabIndex={-1} className="sr-only">
              Search
            </button>
          </>
        )}
      </div>
      <p
        id={`${id}-hint`}
        aria-live="polite"
        className={cn('text-sm', problem ? 'text-accent' : 'text-ink-muted', !hero && !problem && 'sr-only')}
      >
        {problem ??
          (fix
            ? '3–24 letters, digits, _ . or -.'
            : '3–24 letters, digits, _ . or -. A profile link works too. Press / to search from anywhere.')}
      </p>
    </form>
  )
}
