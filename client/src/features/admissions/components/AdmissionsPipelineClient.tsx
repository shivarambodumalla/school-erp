'use client'

import { useState, useEffect, useCallback, type MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Plus, Search, MessageSquarePlus, X, Archive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdmissionsKanban } from './AdmissionsKanban'
import { InquirySheet } from './InquirySheet'
import { AdmissionDetailInline } from './AdmissionDetailInline'

export interface AdmissionListItem {
  id: string
  serialNo: number
  applicationNo: string
  admissionNo: string | null
  status: string
  firstName: string
  lastName: string
  photoUrl: string | null
  gender: string
  admissionType: string
  classId: string | null
  appliedAt: string
  admittedAt: string | null
  _count: { guardians: number; documents: number }
}

export interface Inquiry {
  id: string
  name: string
  phone: string
  email: string | null
  source: string
  notes: string | null
  convertedToAdmissionId: string | null
  createdAt: string
}

interface AdmissionTab {
  id: string
  serialNo: number
  firstName: string
  lastName: string
  applicationNo: string
}

const MAX_TABS = 10

export function AdmissionsPipelineClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { apiParam, addParams } = useInstitutionId()

  const [search, setSearch] = useState('')
  const [admissions, setAdmissions] = useState<AdmissionListItem[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [showInquirySheet, setShowInquirySheet] = useState(false)

  // Tab state — URL ?id is source of truth for active tab
  const urlTabId = searchParams.get('id')
  const [activeTab, setActiveTab] = useState(urlTabId ?? 'all')
  const [openTabs, setOpenTabs] = useState<AdmissionTab[]>([])
  const openedIds = new Set(openTabs.map(t => t.id))
  const hasOpenTabs = openTabs.length > 0

  // Sync activeTab from URL on mount / URL change
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) setActiveTab(id)
    else setActiveTab('all')
  }, [searchParams])

  const updateUrl = useCallback((tabId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tabId) params.set('id', tabId)
    else params.delete('id')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname, searchParams])

  const fetchData = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('take', '100')
    addParams(params)

    Promise.all([
      fetch(`/api/school/admissions?${params}`).then(r => r.json()),
      fetch(`/api/school/inquiries${apiParam}`).then(r => r.json()),
    ])
      .then(([admData, inqData]) => {
        setAdmissions(admData.admissions ?? [])
        setInquiries(Array.isArray(inqData) ? inqData : [])
      })
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  // Filter out rejected — they live on /management/admissions/rejected
  const activeAdmissions = admissions.filter(a => a.status !== 'REJECTED')
  const rejectedCount = admissions.length - activeAdmissions.length

  const openAdmission = useCallback((tab: AdmissionTab, navigate: boolean) => {
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tab.id)) return prev
      const next = [...prev, tab]
      if (next.length > MAX_TABS) next.shift()
      return next
    })
    if (navigate) {
      setActiveTab(String(tab.serialNo))
      updateUrl(String(tab.serialNo))
    }
  }, [updateUrl])

  const closeTab = useCallback((tabKey: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => String(t.serialNo) === tabKey)
      const next = prev.filter(t => String(t.serialNo) !== tabKey)
      setActiveTab(current => {
        if (current !== tabKey) return current
        const leftTab = idx > 0 ? prev[idx - 1] : null
        const newActive = leftTab ? String(leftTab.serialNo) : 'all'
        updateUrl(newActive === 'all' ? null : newActive)
        return newActive
      })
      return next
    })
  }, [updateUrl])

  const handleTabSwitch = useCallback((tabKey: string) => {
    setActiveTab(tabKey)
    updateUrl(tabKey === 'all' ? null : tabKey)
  }, [updateUrl])

  const handleAdmissionClick = useCallback((a: AdmissionListItem, e: MouseEvent) => {
    const tab: AdmissionTab = {
      id: a.id, serialNo: a.serialNo, firstName: a.firstName,
      lastName: a.lastName, applicationNo: a.applicationNo,
    }
    if (e.ctrlKey || e.metaKey) {
      openAdmission(tab, false)
    } else {
      openAdmission(tab, true)
    }
  }, [openAdmission])

  return (
    <div>
      {/* Tab bar — only when user has opened tabs from pipeline */}
      {hasOpenTabs && (
        <div className="sticky top-0 z-10 bg-background -mt-4 md:-mt-6 -mx-4 md:-mx-6 overflow-hidden">
          <div className="flex items-center border-b overflow-x-auto scrollbar-none px-4 md:px-6">
            <button type="button" onClick={() => handleTabSwitch('all')}
              className={`shrink-0 flex items-center gap-2 px-4 h-10 text-sm font-medium
                border-b-2 transition-colors
                ${activeTab === 'all'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              All Admissions
            </button>
            {openTabs.map(t => {
              const tabKey = String(t.serialNo)
              return (
              <div key={t.id}
                className={`shrink-0 flex items-center gap-1 pl-3 pr-1 h-10
                  border-b-2 transition-colors group
                  ${activeTab === tabKey
                    ? 'border-primary text-foreground bg-muted/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <button type="button" onClick={() => handleTabSwitch(tabKey)}
                  className="text-sm font-medium truncate max-w-[120px]"
                  title={`${t.firstName} ${t.lastName} — ${t.applicationNo}`}>
                  {t.firstName} {t.lastName}
                </button>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); closeTab(tabKey) }}
                  className={`p-0.5 rounded transition-colors
                    ${activeTab === tabKey
                      ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                      : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'all' ? (
        <div className="space-y-4 pt-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admissions</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeAdmissions.length} application{activeAdmissions.length !== 1 ? 's' : ''}
                <span className="hidden sm:inline"> · Click to open · Ctrl+Click for background</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4
                  text-muted-foreground" />
                <Input placeholder="Search..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-48" />
              </div>
              <button onClick={() => setShowInquirySheet(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2
                  rounded-md border text-sm font-medium
                  hover:bg-muted transition-colors min-h-[44px]">
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden sm:inline">New Inquiry</span>
              </button>
              <Link href="/management/admissions/new"
                className="inline-flex items-center gap-1.5 px-3 py-2
                  rounded-md bg-primary text-primary-foreground text-sm
                  font-medium hover:bg-primary/90 transition-colors min-h-[44px]">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Application</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3 rounded-xl border p-4">
                  <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                  {[1, 2].map(j => (
                    <div key={j} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <AdmissionsKanban admissions={activeAdmissions} inquiries={inquiries}
              openedIds={openedIds} onOpen={handleAdmissionClick}
              onNewInquiry={() => setShowInquirySheet(true)} />
          )}

          {/* Link to rejected page */}
          {rejectedCount > 0 && (
            <div className="flex justify-center pt-2">
              <Link href="/management/admissions/rejected"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground
                  hover:text-foreground transition-colors">
                <Archive className="h-4 w-4" />
                {rejectedCount} rejected application{rejectedCount !== 1 ? 's' : ''}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <AdmissionDetailInline admissionId={openTabs.find(t => String(t.serialNo) === activeTab)?.id ?? activeTab} />
      )}

      {showInquirySheet && (
        <InquirySheet
          onClose={() => setShowInquirySheet(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}
