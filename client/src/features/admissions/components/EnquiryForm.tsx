'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2 } from 'lucide-react'

/* ─── Types ─── */

interface InstitutionInfo {
  id: string
  name: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string | null
  squareLogoUrl: string | null
}

interface ClassOption {
  id: string
  name: string
}

/* ─── Component ─── */

export function EnquiryForm({ subdomain }: { subdomain: string }) {
  const searchParams = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'

  const [institution, setInstitution] = useState<InstitutionInfo | null>(null)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    studentName: '',
    dob: '',
    targetClassName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    source: 'WEBSITE',
    message: '',
  })

  /* Fetch institution info */
  useEffect(() => {
    fetch(`/api/public/enquire/${subdomain}`)
      .then(r => r.json())
      .then((data: { institution?: InstitutionInfo; classes?: ClassOption[] }) => {
        if (data.institution) setInstitution(data.institution)
        if (data.classes) setClasses(data.classes)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [subdomain])

  const handleChange = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.studentName || !form.dob || !form.targetClassName || !form.parentName || !form.parentPhone) {
      setError('Please fill all required fields')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/public/enquire/${subdomain}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Submission failed. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-3 text-center">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    )
  }

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Institution not found</p>
      </div>
    )
  }

  /* Success state */
  if (submitted) {
    return (
      <div className={`${isEmbed ? '' : 'min-h-screen'} flex items-center justify-center bg-gray-50`}>
        <div className="max-w-md w-full mx-auto p-6 text-center">
          {!isEmbed && institution.logoUrl && (
            <img src={institution.logoUrl} alt={institution.name} className="h-12 mx-auto mb-4" />
          )}
          <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${institution.primaryColor}20` }}>
            <CheckCircle2 className="h-8 w-8" style={{ color: institution.primaryColor }} />
          </div>
          <h2 className="text-xl font-bold mb-2">Enquiry Submitted</h2>
          <p className="text-muted-foreground text-sm">
            Thank you for your interest in {institution.name}.
            Our admissions team will contact you shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isEmbed ? '' : 'min-h-screen'} bg-gray-50`}>
      <div className="max-w-lg w-full mx-auto">
        {/* Header — hidden in embed mode */}
        {!isEmbed && (
          <div className="py-6 px-4 text-center">
            {institution.logoUrl && (
              <img src={institution.logoUrl} alt={institution.name} className="h-14 mx-auto mb-3" />
            )}
            <h1 className="text-2xl font-bold" style={{ color: institution.primaryColor }}>
              {institution.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Admission Enquiry Form</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-5 mx-4 mb-8 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}

          {/* Student Name */}
          <div>
            <label className="text-sm font-medium mb-1 block">Student Name *</label>
            <Input
              value={form.studentName}
              onChange={e => handleChange('studentName', e.target.value)}
              placeholder="Full name of the student"
              className="min-h-[44px]"
              required
            />
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm font-medium mb-1 block">Date of Birth *</label>
            <Input
              type="date"
              value={form.dob}
              onChange={e => handleChange('dob', e.target.value)}
              className="min-h-[44px]"
              required
            />
          </div>

          {/* Target Class */}
          <div>
            <label className="text-sm font-medium mb-1 block">Target Class *</label>
            {classes.length > 0 ? (
              <select
                value={form.targetClassName}
                onChange={e => handleChange('targetClassName', e.target.value)}
                className="w-full rounded-md border px-3 py-2.5 text-sm min-h-[44px] bg-background"
                required
              >
                <option value="">Select a class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            ) : (
              <Input
                value={form.targetClassName}
                onChange={e => handleChange('targetClassName', e.target.value)}
                placeholder="e.g. Class 1, Nursery"
                className="min-h-[44px]"
                required
              />
            )}
          </div>

          {/* Parent Name */}
          <div>
            <label className="text-sm font-medium mb-1 block">Parent / Guardian Name *</label>
            <Input
              value={form.parentName}
              onChange={e => handleChange('parentName', e.target.value)}
              placeholder="Full name"
              className="min-h-[44px]"
              required
            />
          </div>

          {/* Parent Phone */}
          <div>
            <label className="text-sm font-medium mb-1 block">Phone Number *</label>
            <Input
              type="tel"
              value={form.parentPhone}
              onChange={e => handleChange('parentPhone', e.target.value)}
              placeholder="+91 98765 43210"
              className="min-h-[44px]"
              required
            />
          </div>

          {/* Parent Email */}
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={form.parentEmail}
              onChange={e => handleChange('parentEmail', e.target.value)}
              placeholder="email@example.com"
              className="min-h-[44px]"
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-sm font-medium mb-1 block">How did you hear about us?</label>
            <select
              value={form.source}
              onChange={e => handleChange('source', e.target.value)}
              className="w-full rounded-md border px-3 py-2.5 text-sm min-h-[44px] bg-background"
            >
              <option value="WEBSITE">Website</option>
              <option value="SOCIAL">Social Media</option>
              <option value="REFERRAL">Referral</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-1 block">Message</label>
            <textarea
              value={form.message}
              onChange={e => handleChange('message', e.target.value)}
              rows={3}
              placeholder="Any additional information..."
              className="w-full rounded-md border px-3 py-2 text-sm resize-none bg-background"
            />
          </div>

          <Button
            type="submit"
            className="w-full min-h-[48px] text-base font-medium"
            style={{ backgroundColor: institution.primaryColor }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Enquiry'}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            By submitting, you agree to be contacted by {institution.name} regarding admissions.
          </p>
        </form>
      </div>
    </div>
  )
}
