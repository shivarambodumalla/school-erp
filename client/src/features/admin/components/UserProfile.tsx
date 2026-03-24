'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import type { UserProfileProps } from '@/features/admin/types'
import { UserDetailCard } from './UserDetailCard'
import { ChangePasswordForm } from './ChangePasswordForm'

export function UserProfile({ user, initiatorPortalType }: UserProfileProps): JSX.Element {
    const router = useRouter()

    return (
        <div className="space-y-8">
            <button
                type="button"
                onClick={(): void => router.back()}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to All Users
            </button>

            <UserDetailCard user={user} initiatorPortalType={initiatorPortalType} />

            <Separator />

            <ChangePasswordForm userId={user.id} />
        </div>
    )
}
