import { useEffect, useState } from 'react'

interface OnboardingStatus {
    isComplete: boolean
    isLoading: boolean
}

export function useOnboarding(): OnboardingStatus {
    const [isComplete, setIsComplete] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/onboarding/status')
            .then((r) => r.json())
            .then((data: { isComplete: boolean }) => {
                setIsComplete(data.isComplete)
            })
            .catch(() => setIsComplete(true))
            .finally(() => setIsLoading(false))
    }, [])

    return { isComplete, isLoading }
}
