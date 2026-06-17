import { Fragment } from 'react'

interface StepperProps {
  steps: readonly string[]
  current: number
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol aria-label="Étapes" className="mb-8 flex items-start">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo'
        const circleClass =
          state === 'done'
            ? 'bg-focus text-white border-focus'
            : state === 'active'
              ? 'bg-white text-focus border-focus shadow-[0_0_0_4px_rgba(60,90,200,0.12)]'
              : 'bg-white text-gray-700 border-gray-300'
        const labelClass =
          state === 'todo'
            ? 'text-gray-700'
            : state === 'active'
              ? 'text-dark font-semibold'
              : 'text-dark'
        return (
          <Fragment key={label}>
            <li
              aria-current={state === 'active' ? 'step' : undefined}
              className="flex flex-col items-center gap-2 min-w-[64px]"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${circleClass}`}
              >
                {state === 'done' ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${labelClass}`}>{label}</span>
            </li>
            {i < steps.length - 1 && (
              <li
                aria-hidden
                className={`mt-[18px] h-0.5 flex-1 rounded-full transition-colors ${
                  i < current ? 'bg-focus' : 'bg-gray-300'
                }`}
              />
            )}
          </Fragment>
        )
      })}
    </ol>
  )
}
