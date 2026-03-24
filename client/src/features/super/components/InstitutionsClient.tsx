'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, Search, Plus } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { InstitutionRow, type Institution } from './InstitutionRow'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface Props {
    institutions: Institution[]
}

const PLAN_FILTERS = ['STARTER', 'GROWTH', 'PRO'] as const
const STATUS_FILTERS = ['ACTIVE', 'SUSPENDED'] as const

export function InstitutionsClient({ institutions }: Props) {
    const [search, setSearch] = useState('')
    const [planFilters, setPlanFilters] = useState<string[]>([])
    const [statusFilters, setStatusFilters] = useState<string[]>([])
    const [isAddOpen, setIsAddOpen] = useState(false)

    const filtered = institutions.filter((inst) => {
        const matchesSearch =
            search === '' ||
            inst.name.toLowerCase().includes(search.toLowerCase()) ||
            inst.subdomain.toLowerCase().includes(search.toLowerCase())
        const matchesPlan = planFilters.length === 0 || planFilters.includes(inst.planTier)
        const matchesStatus =
            statusFilters.length === 0 ||
            (statusFilters.includes('ACTIVE') && inst.isActive) ||
            (statusFilters.includes('SUSPENDED') && !inst.isActive)
        return matchesSearch && matchesPlan && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header row: title LEFT, controls RIGHT */}
            <div className="flex items-center justify-between gap-6">
                <div className="shrink-0">
                    <h1 className="text-2xl font-bold tracking-tight">Institutions</h1>
                    <p className="text-muted-foreground text-sm">
                        {institutions.length} schools on the platform
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 h-9 w-[260px] rounded-lg border border-gray-300 bg-white px-3 focus-within:ring-1 focus-within:ring-ring">
                        <Search className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                        <input
                            placeholder="Search institutions..."
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-3 bg-white">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {(planFilters.length > 0 || statusFilters.length > 0) && (
                                    <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[260px] p-0">
                            {/* Header */}
                            <div className="px-4 py-3 border-b">
                                <h4 className="text-sm font-semibold">Filters</h4>
                                {/* <p className="text-xs text-muted-foreground mt-0.5">Narrow down results</p> */}
                            </div>

                            {/* Plan Tier group */}
                            <div className="px-4 py-3 border-b">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Plan Tier</p>
                                <div className="space-y-2">
                                    {PLAN_FILTERS.map((p) => (
                                        <label key={p} htmlFor={`plan-${p}`} className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox
                                                id={`plan-${p}`}
                                                checked={planFilters.includes(p)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setPlanFilters([...planFilters, p])
                                                    } else {
                                                        setPlanFilters(planFilters.filter(f => f !== p))
                                                    }
                                                }}
                                            />
                                            <span className="text-sm">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Account Status group */}
                            <div className="px-4 py-3 border-b">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status</p>
                                <div className="space-y-2">
                                    {STATUS_FILTERS.map((s) => (
                                        <label key={s} htmlFor={`status-${s}`} className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox
                                                id={`status-${s}`}
                                                checked={statusFilters.includes(s)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setStatusFilters([...statusFilters, s])
                                                    } else {
                                                        setStatusFilters(statusFilters.filter(f => f !== s))
                                                    }
                                                }}
                                            />
                                            <span className="text-sm">{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear button */}
                            {(planFilters.length > 0 || statusFilters.length > 0) && (
                                <div className="px-4 py-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs h-8"
                                        onClick={() => {
                                            setPlanFilters([])
                                            setStatusFilters([])
                                        }}
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <SheetTrigger asChild>
                            <Button size="sm" className="h-9">
                                <Plus className="h-4 w-4 mr-1.5" />
                                Institution
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Add Institution</SheetTitle>
                                <SheetDescription>
                                    Create a new institution and set up their administrative account.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Institution Name</label>
                                    <Input placeholder="Enter institution name" className="h-9" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Email</label>
                                    <Input type="email" placeholder="admin@school.edu" className="h-9" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Board</label>
                                        <Input placeholder="e.g. CBSE" className="h-9" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Plan Tier</label>
                                        <Input placeholder="e.g. GROWTH" className="h-9" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={() => {
                                    // TODO: Implement actual TRPC mutation here
                                    // Mock success closure
                                    setIsAddOpen(false)
                                }}>Save Institution</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">School</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Board</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Students</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Users</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((inst) => (
                                <InstitutionRow key={inst.id} institution={inst} />
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="text-center text-muted-foreground py-12 text-sm">No institutions found</p>
                    )}
                </div>
            </div>
        </div>
    )
}
