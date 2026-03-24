'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { completeOnboarding } from '@/features/onboarding/actions/onboardingActions'
import { OnboardingStep1Classes } from './OnboardingStep1Classes'
import { OnboardingStep2Staff } from './OnboardingStep2Staff'
import { OnboardingStep3Students } from './OnboardingStep3Students'
import type { ClassEntry, StaffEntry, StudentEntry } from '@/features/onboarding/types'

interface Props {
    institutionId: string
    institutionName: string
}

export function OnboardingWizard({ institutionId, institutionName }: Props) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [classes, setClasses] = useState<ClassEntry[]>([{ name: '', gradeLevel: 1, sectionName: 'A' }])
    const [staff, setStaff] = useState<StaffEntry[]>([{ firstName: '', lastName: '', email: '', portalType: 'TEACHER', password: 'Demo@1234' }])
    const [students, setStudents] = useState<StudentEntry[]>([{ firstName: '', lastName: '', admissionNo: '', dateOfBirth: '', gender: 'MALE', guardianName: '', guardianPhone: '' }])
    const [isPending, startTransition] = useTransition()
    const [done, setDone] = useState(false)

    function handleComplete() {
        startTransition(async () => {
            await completeOnboarding({
                institutionId,
                classes,
                staff,
                students,
                classId: '',
            })
            setDone(true)
            setTimeout(() => router.refresh(), 1500)
        })
    }

    if (done) {
        return (
            <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Setup Complete!</h2>
                    <p className="text-muted-foreground">Redirecting to your dashboard…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {/* Progress */}
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Setting up {institutionName}</p>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded-full transition-colors ${
                                    s <= step ? 'bg-primary' : 'bg-muted'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Step {step} of 3</p>
                </div>

                {step === 1 && <OnboardingStep1Classes classes={classes} onChange={setClasses} />}
                {step === 2 && <OnboardingStep2Staff staff={staff} onChange={setStaff} />}
                {step === 3 && <OnboardingStep3Students students={students} onChange={setStudents} />}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
                        Back
                    </Button>
                    {step < 3 ? (
                        <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
                    ) : (
                        <Button onClick={handleComplete} disabled={isPending}>
                            {isPending ? 'Saving…' : 'Complete Setup'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
