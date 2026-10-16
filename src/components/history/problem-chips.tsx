import type { ProblemAttempt } from '../../lib/codeforces/contests'
import { cn } from '../../lib/cn'

const attempts = (failed: number) => `${failed} failed attempt${failed === 1 ? '' : 's'}`

function describeAttempt(problem: ProblemAttempt) {
  if (problem.solved) return problem.failed ? `Solved after ${attempts(problem.failed)}` : 'Solved first try'
  return `Not solved, ${attempts(problem.failed)}`
}

/** One chip per problem tried: filled when solved, struck through when not. */
export function ProblemChips({ problems }: { problems: ProblemAttempt[] }) {
  if (problems.length === 0) return <span>No submissions</span>
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Problems">
      {problems.map((problem) => (
        <li
          key={problem.index}
          title={`${problem.index}. ${problem.name}: ${describeAttempt(problem)}`}
          className={cn(
            'min-w-[26px] px-1.5 py-px text-center font-label text-[13px] font-bold tracking-[0.04em] [clip-path:polygon(4px_0,100%_0,100%_calc(100%-4px),calc(100%-4px)_100%,0_100%,0_4px)]',
            problem.solved
              ? 'bg-ink/16 text-ink'
              : 'text-ink-muted line-through shadow-[inset_0_0_0_1px_var(--color-line-strong)]',
          )}
        >
          {problem.index}
          <span className="sr-only">: {describeAttempt(problem)}</span>
        </li>
      ))}
    </ul>
  )
}
