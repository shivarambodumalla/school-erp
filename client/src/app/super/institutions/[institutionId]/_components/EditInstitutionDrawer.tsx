'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Accordion, AccordionContent,
  AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  addInstitutionSchema,
  INDIAN_STATES_LIST,
  type AddInstitutionFormData,
} from '@/features/super/schemas/institutionSchema'
import { updateInstitution } from
  '@/features/super/actions/updateInstitution'

interface Institution {
  id: string
  name: string
  subdomain: string
  institutionType: string
  board: string
  planTier: string
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  pinCode: string | null
  phone: string | null
  website: string | null
  establishedYear: number | null
  studentCapacity: number | null
  billingEmail: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: Institution
}

const INSTITUTION_TYPES = [
  { value: 'SCHOOL', label: 'School' },
  { value: 'COLLEGE', label: 'College' },
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'TRAINING_CENTER', label: 'Training Center' },
]

const BOARDS = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'STATE', label: 'State Board' },
]

const PLANS = [
  { value: 'STARTER', label: 'Starter' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'PRO', label: 'Pro' },
]

export function EditInstitutionDrawer({
  open, onOpenChange, institution,
}: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<AddInstitutionFormData>({
    resolver: zodResolver(addInstitutionSchema),
    defaultValues: {
      name: institution.name,
      subdomain: institution.subdomain,
      institutionType: institution.institutionType as
        'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TRAINING_CENTER',
      board_affiliation: institution.board as 'CBSE' | 'ICSE' | 'STATE',
      planTier: institution.planTier as 'STARTER' | 'GROWTH' | 'PRO',
      addressLine1: institution.addressLine1 ?? '',
      addressLine2: institution.addressLine2 ?? '',
      city: institution.city ?? '',
      state: (institution.state ?? '') as
        AddInstitutionFormData['state'],
      pinCode: institution.pinCode ?? '',
      phone: institution.phone ?? '',
      email: institution.billingEmail ?? '',
      website: institution.website ?? '',
      establishedYear: institution.establishedYear ?? undefined,
      studentCapacity: institution.studentCapacity ?? undefined,
    },
  })

  // Reset form when institution changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: institution.name,
        subdomain: institution.subdomain,
        institutionType: institution.institutionType as
          'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TRAINING_CENTER',
        board_affiliation: institution.board as 'CBSE' | 'ICSE' | 'STATE',
        planTier: institution.planTier as 'STARTER' | 'GROWTH' | 'PRO',
        addressLine1: institution.addressLine1 ?? '',
        addressLine2: institution.addressLine2 ?? '',
        city: institution.city ?? '',
        state: (institution.state ?? '') as
          AddInstitutionFormData['state'],
        pinCode: institution.pinCode ?? '',
        phone: institution.phone ?? '',
        email: institution.billingEmail ?? '',
        website: institution.website ?? '',
        establishedYear: institution.establishedYear ?? undefined,
        studentCapacity: institution.studentCapacity ?? undefined,
      })
    }
  }, [open, institution, form])

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) form.reset()
    onOpenChange(isOpen)
  }

  async function onSubmit(data: AddInstitutionFormData) {
    setSubmitting(true)
    const result = await updateInstitution(institution.id, data)
    if (result.success) {
      toast.success('Institution updated successfully!')
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error('Update failed', { description: result.error })
    }
    setSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] p-0 flex flex-col border-l
          border-border max-w-none [&>button:first-child]:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b
          border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Edit Institution
          </h2>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-sm p-1 text-muted-foreground
              hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <Form {...form}>
            <form
              id="edit-institution-form"
              onSubmit={form.handleSubmit(onSubmit)}
              autoComplete="off"
            >
              <Accordion
                type="multiple"
                defaultValue={['basic', 'address', 'contact']}
              >
                {/* Basic Info */}
                <AccordionItem value="basic" className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline py-2.5
                    min-h-[44px]">
                    <span className="text-xs font-semibold uppercase
                      tracking-wider text-muted-foreground">
                      Basic Information
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pt-1 px-px space-y-3.5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Institution Name{' '}
                            <span className="text-[hsl(var(--error))]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input className="min-h-[44px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="institutionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Type{' '}
                              <span className="text-[hsl(var(--error))]">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="min-h-[44px]">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {INSTITUTION_TYPES.map(t => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="board_affiliation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Board{' '}
                              <span className="text-[hsl(var(--error))]">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="min-h-[44px]">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BOARDS.map(b => (
                                  <SelectItem key={b.value} value={b.value}>
                                    {b.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="subdomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Subdomain{' '}
                              <span className="text-[hsl(var(--error))]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Input
                                  {...field}
                                  className="rounded-r-none min-h-[44px]"
                                />
                                <span className="flex items-center px-3 h-[44px]
                                  border border-l-0 rounded-r-md bg-muted
                                  text-muted-foreground text-sm whitespace-nowrap">
                                  .app
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="planTier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="min-h-[44px]">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PLANS.map(p => (
                                  <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Address */}
                <AccordionItem value="address" className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline py-2.5
                    min-h-[44px]">
                    <span className="text-xs font-semibold uppercase
                      tracking-wider text-muted-foreground">
                      Address
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pt-1 px-px space-y-3.5">
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Address Line 1{' '}
                            <span className="text-[hsl(var(--error))]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              City{' '}
                              <span className="text-[hsl(var(--error))]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input className="min-h-[44px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pinCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              PIN Code{' '}
                              <span className="text-[hsl(var(--error))]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                maxLength={6}
                                className="min-h-[44px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            State{' '}
                            <span className="text-[hsl(var(--error))]">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="min-h-[44px]">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {INDIAN_STATES_LIST.map(s => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Contact */}
                <AccordionItem value="contact" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2.5
                    min-h-[44px]">
                    <span className="text-xs font-semibold uppercase
                      tracking-wider text-muted-foreground">
                      Contact
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pt-1 px-px space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phone{' '}
                              <span className="text-[hsl(var(--error))]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="flex items-center px-3
                                  h-[44px] border border-r-0 rounded-l-md
                                  bg-muted text-muted-foreground text-sm">
                                  +91
                                </span>
                                <Input
                                  className="rounded-l-none min-h-[44px]"
                                  maxLength={10}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email{' '}
                              <span className="text-[hsl(var(--error))]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                className="min-h-[44px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://..."
                              className="min-h-[44px]"
                              {...field}
                            />
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
        <div className="border-t border-border px-5 py-3 flex items-center
          justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
            className="min-h-[36px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-institution-form"
            size="sm"
            disabled={submitting}
            className="min-h-[36px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
