'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Props {
  institution: {
    id: string
    name: string
    subdomain: string
  }
  backUrl: string
}

export function SuperManageHeader({ institution, backUrl }: Props) {
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-amber-500
      dark:bg-amber-600 z-50 flex items-center justify-between px-4
      text-amber-950 shadow-sm">
      <button
        type="button"
        onClick={() => router.push(backUrl)}
        className="flex items-center gap-1.5 text-sm font-medium
          hover:underline min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Platform
      </button>

      <div className="flex items-center gap-2 text-sm font-semibold">
        Managing: {institution.name}
        <Badge variant="outline"
          className="border-amber-800 text-amber-900 text-xs">
          {institution.subdomain}
        </Badge>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-amber-950 hover:bg-amber-400 min-h-[44px]"
        onClick={() => router.push(
          `/super/institutions/${institution.id}`
        )}
      >
        <LogOut className="h-4 w-4 mr-1.5" />
        Exit to Platform
      </Button>
    </div>
  )
}
