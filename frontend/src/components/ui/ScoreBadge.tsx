interface ScoreBadgeProps {
  scoreAdaptation: number
}

export function ScoreBadge({ scoreAdaptation }: ScoreBadgeProps) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success-light/30 font-sans text-sm font-bold text-success">
      {scoreAdaptation}%
    </div>
  )
}
