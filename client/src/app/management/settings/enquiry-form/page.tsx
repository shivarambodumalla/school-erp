'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Copy, Check } from 'lucide-react'

interface EnquiryFormSettings {
  id: string
  isEnabled: boolean
  welcomeMessage: string | null
  thankYouMessage: string | null
  requireDOB: boolean
  requirePrevSchool: boolean
  whatsappTemplate: string | null
}

interface InstitutionInfo {
  subdomain: string
}

export default function EnquiryFormSettingsPage() {
  const [settings, setSettings] = useState<EnquiryFormSettings | null>(null)
  const [institution, setInstitution] = useState<InstitutionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/school/settings/enquiry-form')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json() as {
        settings: EnquiryFormSettings
        institution: InstitutionInfo
      }
      setSettings(data.settings)
      setInstitution(data.institution)
    } catch {
      toast.error('Failed to load enquiry form settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/school/settings/enquiry-form', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: settings.isEnabled,
          welcomeMessage: settings.welcomeMessage,
          thankYouMessage: settings.thankYouMessage,
          requireDOB: settings.requireDOB,
          requirePrevSchool: settings.requirePrevSchool,
          whatsappTemplate: settings.whatsappTemplate,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyEmbed = () => {
    if (!institution) return
    const code = `<iframe src="${window.location.origin}/enquire/${institution.subdomain}" width="100%" height="600" frameborder="0"></iframe>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!settings || !institution) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Failed to load settings. Please try again.
      </div>
    )
  }

  const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/enquire/${institution.subdomain}" width="100%" height="600" frameborder="0"></iframe>`

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Enable / Disable */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiry Form</CardTitle>
          <CardDescription>
            Control the public enquiry form that parents use to submit
            admissions enquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Enable enquiry form</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When disabled, the public form will show a closed message
              </p>
            </div>
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => prev ? { ...prev, isEnabled: checked } : prev)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Customize the text shown on the enquiry form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome message</Label>
            <Textarea
              id="welcome-message"
              placeholder="We are glad you are interested in our school..."
              value={settings.welcomeMessage ?? ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, welcomeMessage: e.target.value || null } : prev
                )
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thankyou-message">Thank you message</Label>
            <Textarea
              id="thankyou-message"
              placeholder="Thank you for your enquiry. We will get back to you soon."
              value={settings.thankYouMessage ?? ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, thankYouMessage: e.target.value || null } : prev
                )
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
          <CardDescription>
            Toggle optional fields on the enquiry form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Date of birth</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ask for the student&apos;s date of birth
              </p>
            </div>
            <Switch
              checked={settings.requireDOB}
              onCheckedChange={(checked) =>
                setSettings((prev) => prev ? { ...prev, requireDOB: checked } : prev)
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Previous school</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ask for the student&apos;s previous school name
              </p>
            </div>
            <Switch
              checked={settings.requirePrevSchool}
              onCheckedChange={(checked) =>
                setSettings((prev) =>
                  prev ? { ...prev, requirePrevSchool: checked } : prev
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Template */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Template</CardTitle>
          <CardDescription>
            Auto-reply template sent via WhatsApp when a new enquiry is received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="whatsapp-template">Template message</Label>
            <Textarea
              id="whatsapp-template"
              placeholder="Hi {{parentName}}, thank you for your enquiry at {{schoolName}}..."
              value={settings.whatsappTemplate ?? ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, whatsappTemplate: e.target.value || null } : prev
                )
              }
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {'Use {{parentName}}, {{studentName}}, {{schoolName}} as placeholders'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
          <CardDescription>
            Add this code to your website to embed the enquiry form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Input
              readOnly
              value={embedCode}
              className="pr-12 font-mono text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={handleCopyEmbed}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Public URL:{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              {typeof window !== 'undefined' ? window.location.origin : ''}/enquire/{institution.subdomain}
            </code>
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-h-[44px] min-w-[120px]"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save changes
        </Button>
      </div>
    </div>
  )
}
