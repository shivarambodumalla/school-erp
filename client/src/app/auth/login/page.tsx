"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import type { PortalType } from '@/types'

const PORTAL_OPTIONS: { type: PortalType; label: string; icon: string }[] = [
    { type: 'admin', label: 'Admin', icon: '🛡️' },
    { type: 'teacher', label: 'Teacher', icon: '📚' },
    { type: 'student', label: 'Student', icon: '🎓' },
    { type: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
    { type: 'instructor', label: 'Instructor', icon: '🏋️' },
]

export default function LoginPage(): JSX.Element {
    const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault()

        if (!selectedPortal) return
        if (!email || !password) return

        setIsLoading(true)

        // NextAuth integration will replace this in Week 2
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-[420px] space-y-6">
                {/* Logo + Branding */}
                <div className="text-center space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                        S
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        School ERP
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Select your portal and sign in
                    </p>
                </div>

                {/* Portal Selector */}
                <div className="grid grid-cols-5 gap-2">
                    {PORTAL_OPTIONS.map((portal) => (
                        <button
                            key={portal.type}
                            type="button"
                            onClick={(): void => setSelectedPortal(portal.type)}
                            className={`
                flex flex-col items-center justify-center gap-1 rounded-lg border p-3
                min-h-[72px] min-w-[44px] transition-colors cursor-pointer
                ${selectedPortal === portal.type
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'}
              `}
                        >
                            <span className="text-xl">{portal.icon}</span>
                            <span className="text-[10px] font-medium leading-none">{portal.label}</span>
                        </button>
                    ))}
                </div>

                {/* Login Form */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">
                            {selectedPortal
                                ? `${PORTAL_OPTIONS.find((p) => p.type === selectedPortal)?.label} Login`
                                : 'Sign In'}
                        </CardTitle>
                        <CardDescription>
                            {selectedPortal
                                ? 'Enter your credentials to continue'
                                : 'Choose a portal above to get started'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="you@school.edu"
                                    value={email}
                                    onChange={(e): void => setEmail(e.target.value)}
                                    disabled={!selectedPortal}
                                    className="min-h-[44px]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e): void => setPassword(e.target.value)}
                                    disabled={!selectedPortal}
                                    className="min-h-[44px]"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full min-h-[44px]"
                                disabled={!selectedPortal || isLoading}
                            >
                                {isLoading ? 'Signing in…' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    Contact your school administrator for login credentials.
                </p>
            </div>
        </main>
    )
}
