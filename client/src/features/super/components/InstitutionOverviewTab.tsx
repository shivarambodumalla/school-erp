'use client'

import { Badge } from '@/components/ui/badge'
import type { Institution } from '@/features/super/types'

export function InstitutionOverviewTab({ institution }: { institution: Institution }) {
    return (
        <div className="space-y-4 mt-4">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="text-2xl font-bold">{institution._count.students}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Staff &amp; Users</p>
                    <p className="text-2xl font-bold">{institution._count.users}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Board</p>
                    <p className="text-2xl font-bold">{institution.board}</p>
                </div>
            </div>

            {/* Onboarding */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
                <h3 className="font-semibold text-sm">Onboarding Status</h3>
                {institution.onboarding ? (
                    <div className="space-y-2">
                        {[
                            { label: 'Classes Added', done: institution.onboarding.classesAdded },
                            { label: 'Staff Added', done: institution.onboarding.staffAdded },
                            { label: 'Students Added', done: institution.onboarding.studentsAdded },
                        ].map((step) => (
                            <div key={step.label} className="flex items-center gap-2 text-sm">
                                <div className={`h-2 w-2 rounded-full ${step.done ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                                <span className={step.done ? 'line-through text-muted-foreground' : ''}>{step.label}</span>
                                {step.done && <Badge variant="secondary" className="text-xs">Done</Badge>}
                            </div>
                        ))}
                        {institution.onboarding.completedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Completed {new Date(institution.onboarding.completedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Onboarding not started</p>
                )}
            </div>

            {/* Details */}
            <div className="rounded-xl border bg-card p-4 grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-muted-foreground">Billing Email</p>
                    <p className="font-medium">{institution.billingEmail ?? '—'}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(institution.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    )
}
