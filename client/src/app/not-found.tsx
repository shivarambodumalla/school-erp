import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <p className="text-8xl font-bold text-muted-foreground/30">404</p>
                <h1 className="text-2xl font-bold">Page not found</h1>
                <p className="text-muted-foreground text-sm">
                    The page you are looking for does not exist.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    )
}
