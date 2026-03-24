'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { changePassword } from '@/features/admin/actions/changePassword'
import type { ResultState } from '@/features/admin/types'

export function ChangePasswordForm({ userId }: { userId: string }): JSX.Element {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ResultState | null>(null)

    async function handlePasswordChange(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        const res = await changePassword({
            userId,
            newPassword,
            confirmPassword,
        })

        if (res.success) {
            setResult({ type: 'success', message: 'Password changed successfully.' })
            setNewPassword('')
            setConfirmPassword('')
        } else {
            setResult({ type: 'error', message: res.error ?? 'Something went wrong.' })
        }

        setLoading(false)
    }

    return (
        <div className="max-w-[560px]">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Change Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {result ? (
                            <div
                                className={`flex items-center gap-2 p-3 rounded-md text-sm border ${
                                    result.type === 'success'
                                        ? 'bg-green-50 text-green-800 border-green-200'
                                        : 'bg-red-50 text-red-800 border-red-200'
                                }`}
                            >
                                {result.type === 'success'
                                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    : <AlertCircle className="h-4 w-4 shrink-0" />
                                }
                                {result.message}
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e): void => setNewPassword(e.target.value)}
                                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={(): void => setShowNew(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e): void => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={(): void => setShowConfirm(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                            <li>At least 8 characters</li>
                            <li>At least one uppercase letter</li>
                            <li>At least one number</li>
                        </ul>

                        <Button
                            type="submit"
                            disabled={loading || !newPassword || !confirmPassword}
                            className="w-full sm:w-auto"
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
