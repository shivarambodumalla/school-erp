'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage(): JSX.Element {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault()

        if (!email || !password) return

        setIsLoading(true)
        setError('')

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError('Invalid email or password. Please try again.')
            setIsLoading(false)
            return
        }

        router.push(callbackUrl)
        router.refresh()
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-[400px] space-y-6">
                {/* Logo + Branding */}
                <div className="text-center space-y-3">
                    <img
                        src="/logo-square.svg"
                        alt="Onflows"
                        className="mx-auto h-16 w-16"
                    />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Onflows
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Form */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Sign In</CardTitle>
                        <CardDescription>
                            Enter your email and password to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error ? (
                                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="you@school.edu"
                                    value={email}
                                    onChange={(e): void => setEmail(e.target.value)}
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
                                    className="min-h-[44px]"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full min-h-[44px]"
                                disabled={isLoading}
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
