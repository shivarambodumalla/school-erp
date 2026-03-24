'use client'

import { Button } from '@/components/ui/button'
import type { Institution } from '@/features/super/types'

const PLAN_OPTIONS = ['STARTER', 'GROWTH', 'PRO'] as const

interface InstitutionBillingTabProps {
    institution: Institution
    isPending: boolean
    onPlanChange: (plan: 'STARTER' | 'GROWTH' | 'PRO') => void
}

export function InstitutionBillingTab({ institution, isPending, onPlanChange }: InstitutionBillingTabProps) {
    return (
        <div className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-4 space-y-4">
                <h3 className="font-semibold">Current Plan</h3>
                <div className="flex gap-2">
                    {PLAN_OPTIONS.map((plan) => (
                        <Button
                            key={plan}
                            variant={institution.planTier === plan ? 'default' : 'outline'}
                            size="sm"
                            disabled={isPending || institution.planTier === plan}
                            onClick={() => onPlanChange(plan)}
                        >
                            {plan}
                        </Button>
                    ))}
                </div>
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Custom Pricing</p>
                    <p className="font-medium">{institution.customPricing ? `₹${institution.customPricing}` : 'Standard pricing'}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">Invoice list coming in Phase 4</p>
        </div>
    )
}
