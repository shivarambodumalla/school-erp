'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft, Mail, Building2, Calendar,
    Clock, ShieldCheck, KeyRound, Eye, EyeOff,
    CheckCircle2, AlertCircle,
} from 'lucide-react'
import { changePassword } from '@/features/admin/actions/changePassword'

interface Institution {
    id: string
    name: string
    subdomain: string
    board: string
    planTier: string
    primaryColor: string
    createdAt: string
}

interface User {
    id: string
    email: string
    portalType: string
    isActive: boolean
    lastLoginAt: string | null
    createdAt: string
    institution: Institution
}

interface UserProfileProps {
    user: User
}

const ROLE_COLORS: Record<string, string> = {
    ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    TEACHER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    STUDENT: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    PARENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    INSTRUCTOR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

const PLAN_COLORS: Record<string, string> = {
    STARTER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    GROWTH: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    PRO: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
}

function formatDate(iso: string | null): string {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

interface ResultState {
    type: 'success' | 'error'
    message: string
}

export function UserProfile({ user }: UserProfileProps): JSX.Element {
    const router = useRouter()
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
            userId: user.id,
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
        <div className="space-y-6 max-w-3xl">
            {/* Back button */}
            <button
                type="button"
                onClick={(): void => router.back()}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{user.email}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        User profile and management
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            ${ROLE_COLORS[user.portalType] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {user.portalType}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            ${user.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* User Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">User Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Role</p>
                                <p className="text-sm font-medium">{user.portalType}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Last Login</p>
                                <p className="text-sm font-medium">{formatDate(user.lastLoginAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Institution Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Institution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="text-sm font-medium">{user.institution.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Subdomain</p>
                                <p className="text-sm font-medium">{user.institution.subdomain}.app</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Board</p>
                                <p className="text-sm font-medium">{user.institution.board}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Plan</p>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                ${PLAN_COLORS[user.institution.planTier] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {user.institution.planTier}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Change Password Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Change Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {/* Result message */}
                        {result ? (
                            <div className={`flex items-center gap-2 p-3 rounded-md text-sm
                ${result.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                }`}>
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
                                    {showNew
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />
                                    }
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
                                    {showConfirm
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Password rules hint */}
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
