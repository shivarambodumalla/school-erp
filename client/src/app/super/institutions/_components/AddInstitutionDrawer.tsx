'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Eye, EyeOff, X, CheckCircle2, AlertCircle } from 'lucide-react'

import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { createInstitution, checkSubdomainAvailable } from "@/features/super/actions/institutionActions"

const formSchema = z.object({
    name: z.string().min(2, "Institution name must be at least 2 characters"),
    subdomain: z.string()
        .min(3, "Subdomain must be at least 3 characters")
        .max(30, "Subdomain must be 30 characters or fewer")
        .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
    board: z.enum(['CBSE', 'ICSE', 'STATE'], { message: "Please select a board" }),
    planTier: z.enum(['STARTER', 'GROWTH', 'PRO'], { message: "Please select a plan" }),
    billingEmail: z.string().email("Please enter a valid email").optional().or(z.literal('')),
    adminEmail: z.string().email("Please enter a valid admin email"),
    adminPassword: z.string().min(8, "Password must be at least 8 characters"),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: () => void
}

export function AddInstitutionDrawer({ open, onOpenChange, onSuccess }: Props) {
    const [isSubmitting, setSubmitting] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [subdomainStatus, setSubdomainStatus] = React.useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            subdomain: "",
            board: undefined,
            planTier: undefined,
            billingEmail: "",
            adminEmail: "",
            adminPassword: "",
        },
    })

    function handleOpenChange(isOpen: boolean) {
        if (!isOpen) {
            form.reset()
            setShowPassword(false)
            setSubdomainStatus('idle')
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
        onOpenChange?.(isOpen)
    }

    function handleSubdomainChange(value: string, onChange: (v: string) => void) {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
        onChange(sanitized)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (sanitized.length < 3) {
            setSubdomainStatus('idle')
            return
        }

        setSubdomainStatus('checking')
        debounceRef.current = setTimeout(async () => {
            const available = await checkSubdomainAvailable(sanitized)
            setSubdomainStatus(available ? 'available' : 'taken')
        }, 500)
    }

    async function onSubmit(data: FormValues) {
        if (subdomainStatus === 'taken') {
            form.setError('subdomain', { message: 'This subdomain is already taken' })
            return
        }

        setSubmitting(true)

        try {
            await createInstitution({
                name: data.name,
                subdomain: data.subdomain,
                board: data.board,
                planTier: data.planTier,
                billingEmail: data.billingEmail || undefined,
                adminEmail: data.adminEmail,
                adminPassword: data.adminPassword,
            })

            toast.success('Institution added successfully!', {
                description: 'The new institution is now live on the platform.',
            })

            setTimeout(() => {
                form.reset()
                onOpenChange?.(false)
                onSuccess?.()
            }, 1500)
        } catch (error) {
            toast.error('Failed to add institution', {
                description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
            })
        }

        setSubmitting(false)
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:w-[440px] p-0 flex flex-col border-l border-border max-w-none [&>button:first-child]:hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <h2 className="text-sm font-semibold text-foreground">Add Institution</h2>
                    <button
                        type="button"
                        onClick={() => handleOpenChange(false)}
                        className="rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                {/* Scrollable form */}
                <div className="flex-1 overflow-y-auto px-5 pb-4">
                    <Form {...form}>
                        <form id="add-institution-form" onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
                            <Accordion type="multiple" defaultValue={["details", "admin"]}>

                                {/* Section 1: INSTITUTION DETAILS */}
                                <AccordionItem value="details" className="border-b border-border">
                                    <AccordionTrigger className="hover:no-underline py-2.5 min-h-[44px]">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Institution Details
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5 pt-1 px-px space-y-3.5">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name <span className="text-[hsl(var(--error))]">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter institution name" className="min-h-[44px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="subdomain"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subdomain <span className="text-[hsl(var(--error))]">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. greenvalley"
                                                            className="min-h-[44px]"
                                                            {...field}
                                                            onChange={(e) => handleSubdomainChange(e.target.value, field.onChange)}
                                                        />
                                                    </FormControl>
                                                    <div className="flex items-center gap-1.5 min-h-[20px]">
                                                        {subdomainStatus === 'checking' && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Checking...
                                                            </span>
                                                        )}
                                                        {subdomainStatus === 'available' && (
                                                            <span className="text-xs text-[hsl(var(--success))] flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Available
                                                            </span>
                                                        )}
                                                        {subdomainStatus === 'taken' && (
                                                            <span className="text-xs text-[hsl(var(--error))] flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Already taken
                                                            </span>
                                                        )}
                                                        {subdomainStatus === 'idle' && (
                                                            <FormDescription className="text-xs">
                                                                Lowercase letters, numbers, and hyphens only
                                                            </FormDescription>
                                                        )}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField
                                                control={form.control}
                                                name="board"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Board <span className="text-[hsl(var(--error))]">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="min-h-[44px]">
                                                                    <SelectValue placeholder="Select board" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="CBSE">CBSE</SelectItem>
                                                                <SelectItem value="ICSE">ICSE</SelectItem>
                                                                <SelectItem value="STATE">State Board</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="planTier"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Plan <span className="text-[hsl(var(--error))]">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="min-h-[44px]">
                                                                    <SelectValue placeholder="Select plan" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="STARTER">Starter</SelectItem>
                                                                <SelectItem value="GROWTH">Growth</SelectItem>
                                                                <SelectItem value="PRO">Pro</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="billingEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Billing Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="billing@institution.com" className="min-h-[44px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Section 2: ADMIN ACCOUNT */}
                                <AccordionItem value="admin" className="border-b-0">
                                    <AccordionTrigger className="hover:no-underline py-2.5 min-h-[44px]">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Admin Account
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5 pt-1 px-px space-y-3.5">
                                        <FormField
                                            control={form.control}
                                            name="adminEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email <span className="text-[hsl(var(--error))]">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="admin@institution.com" className="min-h-[44px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="adminPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password <span className="text-[hsl(var(--error))]">*</span></FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="Min. 8 characters"
                                                                className="min-h-[44px] pr-10"
                                                                {...field}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                tabIndex={-1}
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                            </Accordion>
                        </form>
                    </Form>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-5 py-3 flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                        className="min-h-[36px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="add-institution-form"
                        size="sm"
                        disabled={isSubmitting}
                        className="min-h-[36px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Add Institution"
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
