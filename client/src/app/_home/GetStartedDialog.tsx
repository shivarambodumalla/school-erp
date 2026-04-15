'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, Loader2, School } from 'lucide-react'

interface GetStartedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SCHOOL_SIZES = [
  'Under 200 students',
  '200 – 500 students',
  '500 – 1000 students',
  '1000 – 2500 students',
  'Over 2500 students',
]

// sharper form field styling: thicker darker border + clear focus ring
const fieldClass =
  'min-h-[44px] border-2 border-foreground/15 bg-background text-foreground placeholder:text-foreground/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'

const labelClass = 'text-sm font-semibold text-foreground'

export function GetStartedDialog({ open, onOpenChange }: GetStartedDialogProps): JSX.Element {
  const [name, setName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [schoolSize, setSchoolSize] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset(): void {
    setName('')
    setSchoolName('')
    setEmail('')
    setPhone('')
    setSchoolSize('')
    setMessage('')
    setSuccess(false)
    setError(null)
  }

  function handleOpenChange(next: boolean): void {
    if (!next) {
      // close — reset after close anim
      setTimeout(reset, 200)
    }
    onOpenChange(next)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/public/marketing-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          schoolName: schoolName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          schoolSize: schoolSize || undefined,
          message: message.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        {success ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Check className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-bold">Thanks, we'll be in touch</DialogTitle>
            <DialogDescription className="mt-2 text-base">
              Our team will reach out within 24 hours to schedule a demo and walk you through
              Onflows.
            </DialogDescription>
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                className="min-h-[44px] rounded-xl"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
              <Link href="/auth/login">
                <Button variant="outline" className="min-h-[44px] w-full rounded-xl sm:w-auto">
                  Already a customer? Sign in
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <School className="h-4 w-4" />
                </span>
                <DialogTitle className="text-xl font-bold">
                  Let's get your school set up
                </DialogTitle>
              </div>
              <DialogDescription>
                Tell us a bit about your school. Our team will reach out within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="gsd-name" className={labelClass}>
                    Your name *
                  </Label>
                  <Input
                    id="gsd-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                    className={fieldClass}
                    placeholder="Priya Sharma"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gsd-school" className={labelClass}>
                    School name *
                  </Label>
                  <Input
                    id="gsd-school"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={200}
                    className={fieldClass}
                    placeholder="St. Mary's Convent"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gsd-email" className={labelClass}>
                    Email *
                  </Label>
                  <Input
                    id="gsd-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={fieldClass}
                    placeholder="you@school.edu"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gsd-phone" className={labelClass}>
                    Phone *
                  </Label>
                  <Input
                    id="gsd-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    minLength={7}
                    maxLength={20}
                    className={fieldClass}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gsd-size" className={labelClass}>
                  School size
                </Label>
                <Select value={schoolSize} onValueChange={setSchoolSize}>
                  <SelectTrigger id="gsd-size" className={fieldClass}>
                    <SelectValue placeholder="Select size (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gsd-message" className={labelClass}>
                  What are you hoping to solve? (optional)
                </Label>
                <Textarea
                  id="gsd-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className={fieldClass}
                  placeholder="e.g. replacing Google Sheets for fees and attendance..."
                />
              </div>
              {error ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px] rounded-xl"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  className="min-h-[44px] rounded-xl"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Request a demo'
                  )}
                </Button>
              </div>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Already a customer?{' '}
                <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
