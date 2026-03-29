'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage(): JSX.Element {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

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
                    <Image
                        src="/logo-square.svg"
                        alt="Onflows"
                        width={64}
                        height={64}
                        className="mx-auto"
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
                                <div className="relative">
                                    <Input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e): void => setPassword(e.target.value)}
                                        className="min-h-[44px] pr-11"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-0 top-0 h-full px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
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
