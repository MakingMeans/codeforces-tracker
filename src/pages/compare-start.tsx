import { ArrowLeftRight } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { HandleField } from '../components/search/handle-field'
import { Button } from '../components/ui/button'
import { cleanHandle, handleProblem } from '../lib/handle'
import { linkHandler, navigate, routeHref } from '../lib/route'

const EXAMPLES: [string, string][] = [
  ['tourist', 'jiangly'],
  ['Benq', 'tourist'],
]

// The focused field rises above what follows (the other field, the button), so its suggestions are never covered.
const box =
  'cut relative z-10 flex items-stretch focus-within:z-30 [--cut:14px] [--cut-fill:var(--color-surface)] [--cut-line:var(--color-line-strong)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-ink has-[input:focus-visible]:[--cut-line:var(--color-ink)]'
const input =
  'w-0 min-w-0 flex-1 bg-transparent px-4 py-4 text-lg text-ink placeholder:text-ink-muted focus-visible:outline-none'
const label = 'font-label text-[13px] font-semibold tracking-[0.16em] text-ink-muted uppercase'

/** Pick two players to put side by side; the first can come from the profile you were on. */
export function CompareStart({ initial }: { initial: string | null }) {
  const [first, setFirst] = useState(initial ?? '')
  const [second, setSecond] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const id = useId()

  function compare(a: string, b: string) {
    const issue =
      (handleProblem(a) && `First player: ${handleProblem(a)}`) ||
      (handleProblem(b) && `Second player: ${handleProblem(b)}`) ||
      (cleanHandle(a).toLowerCase() === cleanHandle(b).toLowerCase() ? 'Pick two different players.' : null)
    setProblem(issue)
    if (!issue) navigate({ handle: cleanHandle(a), vs: cleanHandle(b) })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    compare(first, second)
  }

  return (
    <section aria-labelledby="compare-title" className="ticks border-b border-line">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-3">
          <p className="font-label text-[13px] font-semibold tracking-[0.18em] text-ink-muted uppercase">
            Head to head
          </p>
          <h1 id="compare-title" className="font-display text-[clamp(40px,7vw,72px)] leading-none uppercase">
            Compare
          </h1>
          <p className="max-w-[62ch] text-lg text-ink-muted">
            Two players side by side: ratings over time, stats, and every contest they both entered.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="relative z-20 grid max-w-[920px] gap-3">
          <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <div className="grid gap-1.5">
              <label htmlFor={`${id}-first`} className={label}>
                First player
              </label>
              <div className={box}>
                <HandleField
                  id={`${id}-first`}
                  value={first}
                  onValueChange={(value) => {
                    setFirst(value)
                    setProblem(null)
                  }}
                  onPick={setFirst}
                  placeholder="e.g. tourist"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={`${id}-problem`}
                  className={input}
                />
              </div>
            </div>
            <span aria-hidden className="justify-self-center pb-3 font-display text-4xl leading-none text-accent">
              VS
            </span>
            <div className="grid gap-1.5">
              <label htmlFor={`${id}-second`} className={label}>
                Second player
              </label>
              <div className={box}>
                <HandleField
                  id={`${id}-second`}
                  value={second}
                  onValueChange={(value) => {
                    setSecond(value)
                    setProblem(null)
                  }}
                  onPick={(handle) => {
                    setSecond(handle)
                    if (first.trim()) compare(first, handle)
                  }}
                  placeholder="e.g. jiangly"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={`${id}-problem`}
                  className={input}
                />
              </div>
            </div>
          </div>
          <p id={`${id}-problem`} aria-live="polite" className="text-sm text-accent empty:hidden">
            {problem}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button type="submit" variant="primary">
              <ArrowLeftRight aria-hidden />
              Compare
            </Button>
            <span className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              Try
              {EXAMPLES.map(([a, b]) => (
                <a
                  key={`${a}-${b}`}
                  href={routeHref({ handle: a, vs: b })}
                  onClick={linkHandler({ handle: a, vs: b })}
                  className="text-ink underline underline-offset-3 hover:text-accent"
                >
                  {a} vs {b}
                </a>
              ))}
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}
