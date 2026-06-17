interface ProgressBarProps {
  etapeCourante: number
  totalEtapes: number
}

export function ProgressBar({ etapeCourante, totalEtapes }: ProgressBarProps) {
  const pourcentage = Math.round((etapeCourante / totalEtapes) * 100)
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">
        {etapeCourante}/{totalEtapes}
      </span>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${pourcentage}%` }}
        />
      </div>
    </div>
  )
}
