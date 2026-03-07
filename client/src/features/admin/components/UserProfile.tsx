'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft, Mail, Building2, Calendar, Globe,
    Clock, ShieldCheck, KeyRound, Eye, EyeOff,
    CheckCircle2, AlertCircle, BadgeCheck,
} from 'lucide-react'
import { changePassword } from '@/features/admin/actions/changePassword'
import { MasqueradeButton } from './MasqueradeButton'

/* ── Types ─────────────────────────────────────────────── */

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
    initiatorPortalType: string
}

interface ResultState {
    type: 'success' | 'error'
    message: string
}

/* ── Color Maps (inline styles to avoid Tailwind purge) ── */

const AVATAR_COLORS: Record<string, string> = {
    ADMIN: '#3B82F6',
    TEACHER: '#6366F1',
    STUDENT: '#8B5CF6',
    PARENT: '#10B981',
    INSTRUCTOR: '#F59E0B',
}

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
    ADMIN: { bg: '#DBEAFE', text: '#1D4ED8' },
    TEACHER: { bg: '#E0E7FF', text: '#4338CA' },
    STUDENT: { bg: '#EDE9FE', text: '#6D28D9' },
    PARENT: { bg: '#D1FAE5', text: '#047857' },
    INSTRUCTOR: { bg: '#FEF3C7', text: '#B45309' },
}

const PLAN_BADGE: Record<string, { bg: string; text: string }> = {
    STARTER: { bg: '#F3F4F6', text: '#4B5563' },
    GROWTH: { bg: '#DBEAFE', text: '#1D4ED8' },
    PRO: { bg: '#EDE9FE', text: '#7C3AED' },
}

/* ── Helpers ───────────────────────────────────────────── */

function formatDate(iso: string | null): string {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
    })
}

function formatDateTime(iso: string | null): string {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function getDuration(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days < 1) return 'Today'
    if (days === 1) return '1 day'
    if (days < 30) return `${days} days`
    const months = Math.floor(days / 30)
    if (months < 12) return months === 1 ? '1 month' : `${months} months`
    const years = Math.floor(months / 12)
    return years === 1 ? '1 year' : `${years} years`
}

function getInitials(email: string): string {
    const name = email.split('@')[0] ?? ''
    return name.substring(0, 2).toUpperCase()
}

/* ── Component ─────────────────────────────────────────── */

export function UserProfile({ user, initiatorPortalType }: UserProfileProps): JSX.Element {
    const router = useRouter()
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ResultState | null>(null)

    const avatarBg = AVATAR_COLORS[user.portalType] ?? '#6B7280'
    const roleBadge = ROLE_BADGE[user.portalType]
    const planBadge = PLAN_BADGE[user.institution.planTier]

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
        <div className="space-y-8">
            {/* Back */}
            <button
                type="button"
                onClick={(): void => router.back()}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to All Users
            </button>

            {/* ── Two-column profile (Card + About) ── */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

                {/* ─ Left: Profile Card ─ */}
                <div style={{ width: '260px', flexShrink: 0 }}>
                    <Card className="shadow-lg overflow-hidden">
                        <CardContent className="p-0">
                            {/* Avatar area */}
                            <div className="flex flex-col items-center pt-8 pb-6 px-4">
                                <div className="relative">
                                    <div
                                        className="rounded-full flex items-center justify-center shadow-md"
                                        style={{
                                            width: '104px',
                                            height: '104px',
                                            backgroundColor: avatarBg,
                                        }}
                                    >
                                        <span className="text-white text-3xl font-bold">
                                            {getInitials(user.email)}
                                        </span>
                                    </div>
                                    {user.isActive ? (
                                        <div
                                            className="absolute flex items-center justify-center rounded-full border-2 border-background"
                                            style={{
                                                bottom: '2px',
                                                right: '2px',
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: '#10B981',
                                            }}
                                        >
                                            <BadgeCheck className="h-3.5 w-3.5 text-white" />
                                        </div>
                                    ) : null}
                                </div>

                                <h2 className="text-lg font-bold mt-3 capitalize">
                                    {user.email.split('@')[0]}
                                </h2>

                                <span
                                    className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                    style={roleBadge ? {
                                        backgroundColor: roleBadge.bg,
                                        color: roleBadge.text,
                                    } : undefined}
                                >
                                    {user.portalType}
                                </span>

                                <div className="mt-4 w-full flex justify-center">
                                    <MasqueradeButton
                                        targetUserId={user.id}
                                        targetEmail={user.email}
                                        targetPortalType={user.portalType}
                                        initiatorPortalType={initiatorPortalType}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Stats */}
                            <div className="px-5 py-4 space-y-3">
                                <div>
                                    <p className="text-2xl font-bold leading-tight">
                                        {getDuration(user.createdAt)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">On platform</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-2xl font-bold leading-tight" style={{
                                        color: user.isActive ? '#059669' : '#DC2626',
                                    }}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Account status</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-2xl font-bold leading-tight">
                                        {user.institution.board}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Education board</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─ Right: About + Details ─ */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 className="text-2xl font-bold mb-6 capitalize">
                        About {user.email.split('@')[0]}
                    </h1>

                    {/* Info rows */}
                    <div className="space-y-4 mb-8">
                        <InfoRow icon={<Mail className="h-5 w-5" />} label="Email" value={user.email} />
                        <InfoRow icon={<ShieldCheck className="h-5 w-5" />} label="Role" value={user.portalType} />
                        <InfoRow icon={<Building2 className="h-5 w-5" />} label="Institution" value={user.institution.name} />
                        <InfoRow icon={<Globe className="h-5 w-5" />} label="Subdomain" value={`${user.institution.subdomain}.app`} />
                        <InfoRow icon={<Clock className="h-5 w-5" />} label="Last login" value={formatDateTime(user.lastLoginAt)} />
                        <InfoRow icon={<BadgeCheck className="h-5 w-5" />} label="Verification" value="Account verified" />
                    </div>

                    <Separator className="mb-6" />

                    {/* Institution grid */}
                    <h2 className="text-lg font-semibold mb-4">Institution Details</h2>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <DetailCard
                            icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                            label="School"
                            value={user.institution.name}
                        />
                        <DetailCard
                            icon={<Globe className="h-4 w-4 text-muted-foreground" />}
                            label="Subdomain"
                            value={`${user.institution.subdomain}.app`}
                        />
                        <Card className="border shadow-sm">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1">Plan Tier</p>
                                <span
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                    style={planBadge ? {
                                        backgroundColor: planBadge.bg,
                                        color: planBadge.text,
                                    } : undefined}
                                >
                                    {user.institution.planTier}
                                </span>
                            </CardContent>
                        </Card>
                        <DetailCard
                            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                            label="Member Since"
                            value={formatDate(user.createdAt)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Password Section ── */}
            <Separator />

            <div style={{ maxWidth: '560px' }}>
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
                                    className="flex items-center gap-2 p-3 rounded-md text-sm border"
                                    style={{
                                        backgroundColor: result.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                                        color: result.type === 'success' ? '#15803D' : '#B91C1C',
                                        borderColor: result.type === 'success' ? '#BBF7D0' : '#FECACA',
                                    }}
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
        </div>
    )
}

/* ── Sub-components ────────────────────────────────────── */

function InfoRow({ icon, label, value }: {
    icon: React.ReactNode
    label: string
    value: string
}): JSX.Element {
    return (
        <div className="flex items-center gap-3">
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <span className="text-sm">
                <span className="text-muted-foreground">{label}:</span>{' '}
                <span className="font-medium">{value}</span>
            </span>
        </div>
    )
}

function DetailCard({ icon, label, value }: {
    icon: React.ReactNode
    label: string
    value: string
}): JSX.Element {
    return (
        <Card className="border shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">{icon}</span>
                    <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
