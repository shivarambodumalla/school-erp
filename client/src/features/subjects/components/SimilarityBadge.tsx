'use client'

import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Props {
  score: number
  threshold: number
  matchInfo?: string | null
  matchedSubmissionText?: string | null
  originalText?: string | null
}

export function SimilarityBadge({
  score,
  threshold,
  matchInfo,
  matchedSubmissionText,
  originalText,
}: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const isAbove = score > threshold
  const pct = Math.round(score)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDetails(true)}
        className={`inline-flex items-center gap-1 px-2 py-0.5
          rounded-full text-xs font-medium transition-colors
          min-h-[28px] cursor-pointer
          ${isAbove
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        title={`Similarity: ${pct}%`}
      >
        {isAbove ? (
          <AlertTriangle className="h-3 w-3 shrink-0" />
        ) : (
          <ShieldCheck className="h-3 w-3 shrink-0" />
        )}
        {pct}%
      </button>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Similarity Report</DialogTitle>
            <DialogDescription>
              This submission has a {pct}% similarity score
              {isAbove
                ? ' \u2014 above the threshold of ' + threshold + '%'
                : ' \u2014 within acceptable range'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Score indicator */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all
                      ${isAbove ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
              <span className={`text-sm font-bold
                ${isAbove ? 'text-red-600' : 'text-green-600'}`}>
                {pct}%
              </span>
            </div>

            {/* Match information */}
            {matchInfo && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Matched with
                </p>
                <p className="text-sm font-medium">{matchInfo}</p>
              </div>
            )}

            {/* Side by side comparison */}
            {originalText && matchedSubmissionText && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    This Submission
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-3
                    text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {originalText}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Matched Source
                  </p>
                  <div className="rounded-lg border bg-red-50 p-3
                    text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {matchedSubmissionText}
                  </div>
                </div>
              </div>
            )}

            {!originalText && !matchedSubmissionText && !matchInfo && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Detailed comparison data is not yet available.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
