'use client'

import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
}

/**
 * Extracts YouTube video ID from various URL formats.
 */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

export function VideoViewer({ item }: Props) {
  const videoUrl = item.url ?? ''
  const youtubeId = getYouTubeId(videoUrl)

  return (
    <div className="space-y-4">
      {/* Responsive video embed */}
      <div
        className="relative w-full overflow-hidden rounded-xl
          border bg-black"
        style={{ paddingBottom: '56.25%' }}
      >
        {youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="absolute inset-0 h-full w-full"
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        ) : (
          <div
            className="absolute inset-0 flex items-center
              justify-center text-muted-foreground"
          >
            <p className="text-sm">No video URL provided</p>
          </div>
        )}
      </div>

      {/* Meta info */}
      {item.videoDuration && (
        <p className="text-sm text-muted-foreground">
          Duration: {item.videoDuration} minutes
        </p>
      )}
    </div>
  )
}
