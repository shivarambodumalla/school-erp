'use client'

import { useState, useEffect } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Mail, MessageSquare, Phone, CheckCircle2, XCircle,
  ChevronRight, Eye, EyeOff,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────── */

interface Template {
  id: string
  type: string
  channel: string
  titleTemplate: string
  bodyTemplate: string
  htmlTemplate?: string
  variables: string[]
}

interface ChannelConfig {
  channel: 'email' | 'sms' | 'whatsapp'
  enabled: boolean
  provider: string
  config: Record<string, string>
}

/* ── Constants ─────────────────────────────────────── */

const TYPE_GROUPS: Record<string, string[]> = {
  Finance: ['FEE_DUE', 'FEE_PAID', 'FEE_OVERDUE'],
  Attendance: ['ATTENDANCE_ABSENT', 'ATTENDANCE_SUMMARY'],
  Academic: ['GRADE_PUBLISHED', 'ASSIGNMENT_DUE', 'QUIZ_AVAILABLE', 'HOMEWORK_ASSIGNED'],
  School: ['ANNOUNCEMENT', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'SUBSTITUTION', 'GENERAL', 'SYSTEM'],
}

const CHANNEL_META = {
  email: { label: 'Email', icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  sms: { label: 'SMS', icon: MessageSquare, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  whatsapp: { label: 'WhatsApp', icon: Phone, color: 'text-green-600', bgColor: 'bg-green-50' },
} as const

const EMAIL_PROVIDERS = ['SMTP', 'SendGrid', 'AWS SES', 'Resend', 'Postmark']
const SMS_PROVIDERS = ['Twilio', 'MSG91', 'TextLocal', 'AWS SNS']
const WHATSAPP_PROVIDERS = ['Twilio', 'Interakt', 'WATI', 'WhatsApp Cloud API']

const PROVIDER_MAP: Record<string, string[]> = {
  email: EMAIL_PROVIDERS,
  sms: SMS_PROVIDERS,
  whatsapp: WHATSAPP_PROVIDERS,
}

const CHANNEL_FIELDS: Record<string, { key: string; label: string; secret?: boolean }[]> = {
  email: [
    { key: 'from_name', label: 'From Name' },
    { key: 'from_email', label: 'From Email' },
    { key: 'host', label: 'SMTP Host' },
    { key: 'port', label: 'Port' },
    { key: 'username', label: 'Username' },
    { key: 'password', label: 'Password', secret: true },
  ],
  sms: [
    { key: 'sender_id', label: 'Sender ID' },
    { key: 'api_key', label: 'API Key', secret: true },
    { key: 'api_secret', label: 'API Secret', secret: true },
  ],
  whatsapp: [
    { key: 'phone_number_id', label: 'Phone Number ID' },
    { key: 'api_key', label: 'API Key', secret: true },
    { key: 'webhook_url', label: 'Webhook URL' },
  ],
}

/* ── Main Component ────────────────────────────────── */

export function NotificationTemplatesClient() {
  return (
    <Tabs defaultValue="channels" className="space-y-6">
      <TabsList>
        <TabsTrigger value="channels">Channels</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>
      <TabsContent value="channels">
        <ChannelsTab />
      </TabsContent>
      <TabsContent value="templates">
        <TemplatesTab />
      </TabsContent>
    </Tabs>
  )
}

/* ── Channels Tab ──────────────────────────────────── */

function ChannelsTab() {
  const { apiParam } = useInstitutionId()
  const [channels, setChannels] = useState<ChannelConfig[]>([
    { channel: 'email', enabled: false, provider: '', config: {} },
    { channel: 'sms', enabled: false, provider: '', config: {} },
    { channel: 'whatsapp', enabled: false, provider: '', config: {} },
  ])
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch(`/api/school/notifications/channels${apiParam}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.channels) {
          setChannels(prev => prev.map(ch => {
            const remote = data.channels.find((c: ChannelConfig) => c.channel === ch.channel)
            return remote ? { ...ch, ...remote } : ch
          }))
        }
      })
      .catch(() => { /* use defaults */ })
  }, [apiParam])

  const toggleChannel = async (channel: string, enabled: boolean) => {
    setChannels(prev => prev.map(ch =>
      ch.channel === channel ? { ...ch, enabled } : ch
    ))
    // Auto-expand when enabling
    if (enabled && !expandedChannel) setExpandedChannel(channel)
  }

  const updateConfig = (channel: string, key: string, value: string) => {
    setChannels(prev => prev.map(ch =>
      ch.channel === channel ? { ...ch, config: { ...ch.config, [key]: value } } : ch
    ))
  }

  const updateProvider = (channel: string, provider: string) => {
    setChannels(prev => prev.map(ch =>
      ch.channel === channel ? { ...ch, provider } : ch
    ))
  }

  const saveChannel = async (channel: string) => {
    setSaving(channel)
    try {
      const ch = channels.find(c => c.channel === channel)
      await fetch(`/api/school/notifications/channels${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ch),
      })
      toast.success(`${CHANNEL_META[channel as keyof typeof CHANNEL_META].label} settings saved`)
    } catch {
      toast.error('Failed to save channel settings')
    } finally {
      setSaving(null)
    }
  }

  const testChannel = async (channel: string) => {
    try {
      const res = await fetch(`/api/school/notifications/channels/test${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      })
      if (res.ok) toast.success('Test message sent!')
      else toast.error('Test failed — check your configuration')
    } catch {
      toast.error('Test failed')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Communication Channels</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure how notifications are delivered to parents and staff
        </p>
      </div>

      {channels.map(ch => {
        const meta = CHANNEL_META[ch.channel as keyof typeof CHANNEL_META]
        const Icon = meta.icon
        const isExpanded = expandedChannel === ch.channel
        const providers = PROVIDER_MAP[ch.channel] ?? []
        const fields = CHANNEL_FIELDS[ch.channel] ?? []

        return (
          <Card key={ch.channel} className="overflow-hidden">
            {/* Channel header */}
            <button type="button"
              onClick={() => setExpandedChannel(isExpanded ? null : ch.channel)}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left">
              <div className={`h-10 w-10 rounded-lg ${meta.bgColor} ${meta.color}
                flex items-center justify-center shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{meta.label}</p>
                  {ch.enabled ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5" /> Disabled
                    </span>
                  )}
                </div>
                {ch.provider && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Provider: {ch.provider}
                  </p>
                )}
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform
                ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded config */}
            {isExpanded && (
              <div className="border-t px-4 py-4 space-y-4">
                {/* Enable toggle */}
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable {meta.label}</span>
                  <button type="button"
                    onClick={() => toggleChannel(ch.channel, !ch.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full
                      transition-colors ${ch.enabled ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white
                      transition-transform ${ch.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>

                {ch.enabled && (
                  <>
                    {/* Provider select */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Provider</label>
                      <select value={ch.provider}
                        onChange={e => updateProvider(ch.channel, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background
                          px-3 py-2 text-sm min-h-[44px]">
                        <option value="">Select provider...</option>
                        {providers.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Config fields */}
                    {ch.provider && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {fields.map(field => (
                          <div key={field.key} className="space-y-1.5">
                            <label className="text-sm font-medium">{field.label}</label>
                            <div className="relative">
                              <Input
                                type={field.secret && !showSecrets[`${ch.channel}_${field.key}`] ? 'password' : 'text'}
                                value={ch.config[field.key] ?? ''}
                                onChange={e => updateConfig(ch.channel, field.key, e.target.value)}
                                placeholder={field.label}
                                className="min-h-[44px] pr-10"
                              />
                              {field.secret && (
                                <button type="button"
                                  onClick={() => setShowSecrets(prev => ({
                                    ...prev,
                                    [`${ch.channel}_${field.key}`]: !prev[`${ch.channel}_${field.key}`],
                                  }))}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground
                                    hover:text-foreground transition-colors">
                                  {showSecrets[`${ch.channel}_${field.key}`]
                                    ? <EyeOff className="h-4 w-4" />
                                    : <Eye className="h-4 w-4" />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button className="min-h-[44px]"
                        disabled={saving === ch.channel}
                        onClick={() => saveChannel(ch.channel)}>
                        {saving === ch.channel ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" className="min-h-[44px]"
                        onClick={() => testChannel(ch.channel)}>
                        Send Test
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

/* ── Templates Tab ─────────────────────────────────── */

type TemplateChannel = 'push' | 'email' | 'sms' | 'whatsapp'

function TemplatesTab() {
  const { apiParam } = useInstitutionId()
  const [templates, setTemplates] = useState<Template[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editHtml, setEditHtml] = useState('')
  const [editChannel, setEditChannel] = useState<TemplateChannel>('push')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/school/notifications/templates${apiParam}`)
      .then(r => r.json())
      .then(data => {
        setTemplates(data.templates ?? data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [apiParam])

  function startEdit(t: Template) {
    setEditing(t.id)
    setEditTitle(t.titleTemplate)
    setEditBody(t.bodyTemplate)
    setEditHtml(t.htmlTemplate ?? '')
    setEditChannel((t.channel as TemplateChannel) ?? 'push')
  }

  async function handleSave(t: Template) {
    setSaving(true)
    try {
      await fetch(`/api/school/notifications/templates${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: t.id,
          type: t.type,
          channel: editChannel,
          titleTemplate: editTitle,
          bodyTemplate: editBody,
          ...(editChannel === 'email' && editHtml ? { htmlTemplate: editHtml } : {}),
        }),
      })
      setTemplates(prev =>
        prev.map(tp => tp.id === t.id
          ? { ...tp, titleTemplate: editTitle, bodyTemplate: editBody, channel: editChannel, htmlTemplate: editHtml }
          : tp)
      )
      setEditing(null)
      toast.success('Template saved')
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )

  const grouped = Object.entries(TYPE_GROUPS).map(([group, types]) => ({
    group,
    items: templates.filter(t => types.includes(t.type)),
  })).filter(g => g.items.length > 0)

  const CHANNEL_TABS: { value: TemplateChannel; label: string }[] = [
    { value: 'push', label: 'Push' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Message Templates</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customize notification content per channel. Email supports HTML templates.
        </p>
      </div>

      {grouped.map(({ group, items }) => (
        <div key={group} className="space-y-3">
          <h3 className="font-semibold text-base">{group}</h3>
          {items.map(t => (
            <Card key={t.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t.type.replace(/_/g, ' ')}</Badge>
                  {t.channel && t.channel !== 'push' && (
                    <Badge variant="outline" className="text-xs">{t.channel}</Badge>
                  )}
                </div>
                {editing !== t.id && (
                  <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => startEdit(t)}>
                    Edit
                  </Button>
                )}
              </div>
              {editing === t.id ? (
                <div className="space-y-3">
                  {/* Channel selector */}
                  <div className="flex gap-1 p-0.5 bg-muted rounded-lg w-fit">
                    {CHANNEL_TABS.map(ch => (
                      <button key={ch.value} type="button"
                        onClick={() => setEditChannel(ch.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                          ${editChannel === ch.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                          }`}>
                        {ch.label}
                      </button>
                    ))}
                  </div>

                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    placeholder="Subject / Title" className="min-h-[44px]" />

                  <textarea value={editBody} onChange={e => setEditBody(e.target.value)}
                    rows={3} placeholder="Message body (plain text)"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />

                  {/* Email HTML template */}
                  {editChannel === 'email' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        HTML Template (optional — used instead of plain text for email)
                      </label>
                      <textarea value={editHtml} onChange={e => setEditHtml(e.target.value)}
                        rows={6} placeholder="<html>...</html>"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2
                          text-sm font-mono resize-y" />
                    </div>
                  )}

                  {/* Variables */}
                  <div className="flex flex-wrap gap-1">
                    {(t.variables ?? []).map(v => (
                      <Badge key={v} variant="outline" className="text-xs cursor-pointer"
                        onClick={() => {
                          if (editChannel === 'email' && editHtml) {
                            setEditHtml(prev => prev + `{{${v}}}`)
                          } else {
                            setEditBody(prev => prev + `{{${v}}}`)
                          }
                        }}>
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" className="min-h-[44px]" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                    <Button className="min-h-[44px]" disabled={saving} onClick={() => handleSave(t)}>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">{t.titleTemplate}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.bodyTemplate}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ))}

      {templates.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No templates configured</p>
      )}
    </div>
  )
}
