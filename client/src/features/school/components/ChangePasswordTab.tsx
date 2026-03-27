'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { changePassword } from
  '@/features/school/actions/changePasswordAction'

export function ChangePasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    startTransition(async () => {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (result.success) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(result.error ?? 'Failed to change password')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Change Password</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Your password must be at least 8 characters long.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-pw">Current Password</Label>
          <Input
            id="current-pw"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-pw">New Password</Label>
          <div className="relative">
            <Input
              id="new-pw"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="min-h-[44px] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-muted-foreground hover:text-foreground"
            >
              {showNew
                ? <EyeOff className="h-4 w-4" />
                : <Eye className="h-4 w-4" />
              }
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-pw">Confirm New Password</Label>
          <Input
            id="confirm-pw"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="min-h-[44px]"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
        className="min-h-[44px]"
      >
        {isPending ? 'Changing...' : 'Change Password'}
      </Button>
    </form>
  )
}