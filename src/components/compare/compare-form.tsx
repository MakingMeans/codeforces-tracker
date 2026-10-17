import { ArrowLeftRight, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { cleanHandle, handleProblem } from '../../lib/handle'
import { navigate } from '../../lib/route'
import { Button } from '../ui/button'
import { HandleField } from '../search/handle-field'
import { fieldClass } from '../ui/field-class'

/** "Compare" on a profile: opens a small field for the second handle. */
export function CompareForm({ handle }: { handle: string }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  if (!open) {
    return (
      <Button
        onClick={() => {
          setOpen(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
      >
        <ArrowLeftRight aria-hidden />
        Compare
      </Button>
    )
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    go(value)
  }

  function go(typed: string) {
    const found =
      handleProblem(typed) ??
      (cleanHandle(typed).toLowerCase() === handle.toLowerCase() ? 'Pick someone else to compare with.' : null)
    setProblem(found)
    if (found) return
    navigate({ handle, vs: cleanHandle(typed) })
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={`${id}-vs`}
          className="font-label text-[13px] font-semibold tracking-[0.16em] text-ink-muted uppercase"
        >
          Compare with
        </label>
        <div className="relative z-20 w-48">
          <HandleField
            ref={inputRef}
            id={`${id}-vs`}
            value={value}
            onValueChange={(next) => {
              setValue(next)
              if (problem) setProblem(null)
            }}
            onPick={(picked) => {
              setValue(picked)
              go(picked)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false)
            }}
            placeholder="Another handle"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={problem ? true : undefined}
            aria-describedby={`${id}-problem`}
            className={fieldClass('w-full py-2')}
            listClassName="w-72"
          />
        </div>
        <Button type="submit" variant="primary" className="px-4 py-2">
          Go
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} aria-label="Close" className="px-2 py-2">
          <X aria-hidden />
        </Button>
      </div>
      <p id={`${id}-problem`} aria-live="polite" className="text-sm text-accent">
        {problem}
      </p>
    </form>
  )
}
