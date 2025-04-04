import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullPage?: boolean
  className?: string
}

export function Loading({ size = "md", text = "로딩 중...", fullPage = false, className = "" }: LoadingProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const loaderSize = sizeMap[size]

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className={`${loaderSize} animate-spin text-primary ${className}`} />
        {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${loaderSize} animate-spin text-primary`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

export function LoadingCard() {
  return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, index) => (
				<div className="rounded-lg border bg-card shadow-sm p-6 animate-pulse" key={index}>
					<div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="space-y-3">
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						<div className="h-4 bg-gray-200 rounded w-2/3"></div>
					</div>
				</div>
			))}
		</div>
  )
}

export function LoadingTable({ rows = 3, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-md border animate-pulse">
      <div className="border-b bg-muted/50 p-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-24"></div>
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b p-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

