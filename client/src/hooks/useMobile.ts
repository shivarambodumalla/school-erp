"use client"

import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export function useMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = (): void => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return (): void => {
            window.removeEventListener('resize', checkMobile)
        }
    }, [])

    return isMobile
}
