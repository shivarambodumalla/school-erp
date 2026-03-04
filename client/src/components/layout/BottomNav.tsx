"use client"

export function BottomNav(): JSX.Element {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background min-h-[56px] flex items-center justify-around">
            <p className="text-sm text-muted-foreground">Bottom Navigation</p>
        </nav>
    )
}
