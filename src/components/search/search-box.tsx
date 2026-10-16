import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { cn } from '../../lib/cn'
import { cleanHandle, handleProblem } from '../../lib/handle'
import { navigate } from '../../lib/route'
import { buttonClass } from '../ui/button-class'

interface SearchBoxProps {
  /** `hero` on the home page, `compact` in the top bar. */
  variant: 'hero' | 'compact'
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/** Handle search. Checks the handle before anything is sent to Codeforces; `/` focuses it from anywhere. */
export function SearchBox({ variant }: SearchBoxProps) {
  const [value, setValue] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const hero = variant === 'hero'

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function submit(event: FormEvent) {
    event.preventDefault()
    const found = handleProblem(value)
    setProblem(found)
    if (found) {
      inputRef.current?.focus()
      return
    }
    setValue('')
    inputRef.current?.blur()
    navigate({ handle: cleanHandle(value) })
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      noValidate
      className={cn('grid gap-2', hero ? 'max-w-[640px]' : 'w-full max-w-[420px]')}
    >
      <div
        className={cn(
          'cut flex items-stretch [--cut-fill:var(--color-surface)] [--cut-line:var(--color-line-strong)] focus-within:[--cut-line:var(--color-ink)]',
          hero ? '[--cut:14px]' : '[--cut:10px]',
          problem && '[--cut-line:var(--color-accent)]',
        )}
      >
        <label htmlFor={`${id}-handle`} className="sr-only">
          Codeforces handle
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
        ) : (
          <>
            <kbd
              aria-hidden
              className="mr-2 hidden self-center px-1.5 font-label text-xs font-bold text-ink-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] sm:block"
            >
              /
            </kbd>
            <button type="submit" className="sr-only">
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
        {problem ?? '3–24 letters, digits, _ . or -. A profile link works too. Press / to search from anywhere.'}
      </p>
    </form>
  )
}
