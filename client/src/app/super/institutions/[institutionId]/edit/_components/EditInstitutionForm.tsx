'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  addInstitutionSchema,
  INDIAN_STATES_LIST,
  type AddInstitutionFormData,
} from '@/features/super/schemas/institutionSchema'
import { updateInstitution } from
  '@/features/super/actions/updateInstitution'

interface Props {
  institution: {
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

export function EditInstitutionForm({ institution }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

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

  async function onSubmit(data: AddInstitutionFormData) {
    setSubmitting(true)
    const result = await updateInstitution(institution.id, data)
    if (result.success) {
      toast.success('Institution updated successfully!')
      router.push(`/super/institutions/${institution.id}`)
    } else {
      toast.error('Update failed', { description: result.error })
    }
    setSubmitting(false)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Basic Info */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider
            text-muted-foreground">
            Basic Information
          </p>

          <FormField control={form.control} name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="institutionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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

            <FormField control={form.control} name="board_affiliation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain *</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        {...field}
                        className="rounded-r-none"
                      />
                      <span className="flex items-center px-3 h-10
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

            <FormField control={form.control} name="planTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
        </div>

        {/* Address */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider
            text-muted-foreground">
            Address
          </p>

          <FormField control={form.control} name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1 *</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField control={form.control} name="addressLine2"
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

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="pinCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN Code *</FormLabel>
                  <FormControl>
                    <Input maxLength={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField control={form.control} name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60">
                    {INDIAN_STATES_LIST.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider
            text-muted-foreground">
            Contact
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="flex items-center px-3 h-10
                        border border-r-0 rounded-l-md bg-muted
                        text-muted-foreground text-sm">
                        +91
                      </span>
                      <Input
                        className="rounded-l-none"
                        maxLength={10}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField control={form.control} name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
