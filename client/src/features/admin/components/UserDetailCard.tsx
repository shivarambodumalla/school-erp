import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Mail, Building2, Calendar, Globe,
    Clock, ShieldCheck, BadgeCheck,
} from 'lucide-react'
import { ROLE_COLORS, PLAN_COLORS, getAvatarColor } from '@/lib/colors'
import type { AdminUser } from '@/features/admin/types'
import { MasqueradeButton } from './MasqueradeButton'

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

/* ── Main Component ────────────────────────────────────── */

export function UserDetailCard({ user, initiatorPortalType }: {
    user: AdminUser
    initiatorPortalType: string
}): JSX.Element {
    const avatarColor = getAvatarColor(user.email)
    const roleColor = ROLE_COLORS[user.portalType] ?? ''
    const planColor = PLAN_COLORS[user.institution.planTier] ?? ''

    return (
        <div className="flex gap-8 items-start">
            {/* Left: Profile Card */}
            <div className="w-[260px] shrink-0">
                <Card className="shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col items-center pt-8 pb-6 px-4">
                            <div className="relative">
                                <div
                                    className={`w-[104px] h-[104px] rounded-full flex items-center justify-center shadow-md ${avatarColor}`}
                                >
                                    <span className="text-white text-3xl font-bold">
                                        {getInitials(user.email)}
                                    </span>
                                </div>
                                {user.isActive ? (
                                    <div className="absolute bottom-0.5 right-0.5 w-6 h-6 flex items-center justify-center rounded-full border-2 border-background bg-emerald-500">
                                        <BadgeCheck className="h-3.5 w-3.5 text-white" />
                                    </div>
                                ) : null}
                            </div>

                            <h2 className="text-lg font-bold mt-3 capitalize">
                                {user.email.split('@')[0]}
                            </h2>

                            <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColor}`}>
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

                        <div className="px-5 py-4 space-y-3">
                            <div>
                                <p className="text-2xl font-bold leading-tight">
                                    {getDuration(user.createdAt)}
                                </p>
                                <p className="text-xs text-muted-foreground">On platform</p>
                            </div>
                            <Separator />
                            <div>
                                <p className={`text-2xl font-bold leading-tight ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
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

            {/* Right: About + Details */}
            <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-6 capitalize">
                    About {user.email.split('@')[0]}
                </h1>

                <div className="space-y-4 mb-8">
                    <InfoRow icon={<Mail className="h-5 w-5" />} label="Email" value={user.email} />
                    <InfoRow icon={<ShieldCheck className="h-5 w-5" />} label="Role" value={user.portalType} />
                    <InfoRow icon={<Building2 className="h-5 w-5" />} label="Institution" value={user.institution.name} />
                    <InfoRow icon={<Globe className="h-5 w-5" />} label="Subdomain" value={`${user.institution.subdomain}.app`} />
                    <InfoRow icon={<Clock className="h-5 w-5" />} label="Last login" value={formatDateTime(user.lastLoginAt)} />
                    <InfoRow icon={<BadgeCheck className="h-5 w-5" />} label="Verification" value="Account verified" />
                </div>

                <Separator className="mb-6" />

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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${planColor}`}>
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
    )
}
