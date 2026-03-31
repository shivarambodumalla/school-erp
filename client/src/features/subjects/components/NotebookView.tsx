'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Loader2,
  Search,
  FileDown,
  BookOpen,
  ChevronDown,
  ChevronRight,
  StickyNote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// ─── Types ───

interface ModuleItem {
  id: string
  title: string
  type: string
}

interface Module {
  id: string
  title: string
  items: ModuleItem[]
}

interface StudentNote {
  id: string
  moduleItemId: string
  moduleItemTitle: string
  moduleName: string
  content: string
  updatedAt: string
}

// ─── Props ───

interface Props {
  subjectId: string
}

export function NotebookView({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const [modules, setModules] = useState<Module[]>([])
  const [notes, setNotes] = useState<StudentNote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<
    string | null
  >(null)
  const [editingNote, setEditingNote] = useState<
    StudentNote | null
  >(null)
  const [editContent, setEditContent] = useState('')
  const [expandedModules, setExpandedModules] = useState<
    Set<string>
  >(new Set())
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const [saving, setSaving] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/notes?${params}`
      )
      if (!res.ok) return
      const data = (await res.json()) as {
        modules: Module[]
        notes: StudentNote[]
      }
      setModules(data.modules)
      setNotes(data.notes)
      // Expand all modules by default
      setExpandedModules(
        new Set(data.modules.map((m) => m.id))
      )
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Auto-save on blur with debounce
  const saveNote = useCallback(
    async (noteId: string, content: string) => {
      setSaving(true)
      try {
        const params = new URLSearchParams()
        addParams(params)
        const res = await fetch(
          `/api/school/subjects/${subjectId}/notes/${noteId}?${params}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          }
        )
        if (res.ok) {
          setNotes((prev) =>
            prev.map((n) =>
              n.id === noteId
                ? {
                    ...n,
                    content,
                    updatedAt: new Date().toISOString(),
                  }
                : n
            )
          )
        } else {
          toast.error('Failed to save note')
        }
      } catch {
        toast.error('Failed to save note')
      } finally {
        setSaving(false)
      }
    },
    [subjectId, addParams]
  )

  const createNote = useCallback(
    async (moduleItemId: string) => {
      try {
        const params = new URLSearchParams()
        addParams(params)
        const res = await fetch(
          `/api/school/subjects/${subjectId}/notes?${params}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              moduleItemId,
              content: '',
            }),
          }
        )
        if (res.ok) {
          const data = (await res.json()) as {
            note: StudentNote
          }
          setNotes((prev) => [...prev, data.note])
          setEditingNote(data.note)
          setEditContent('')
        }
      } catch {
        toast.error('Failed to create note')
      }
    },
    [subjectId, addParams]
  )

  const handleEditContentChange = (value: string) => {
    setEditContent(value)
    // Debounced auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    if (editingNote) {
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(editingNote.id, value)
      }, 1000)
    }
  }

  const handleBlur = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    if (editingNote && editContent !== editingNote.content) {
      saveNote(editingNote.id, editContent)
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(
      selectedItemId === itemId ? null : itemId
    )
    setEditingNote(null)
    setEditContent('')
  }

  const handleEditNote = (note: StudentNote) => {
    // Save any pending edit first
    if (editingNote && editContent !== editingNote.content) {
      saveNote(editingNote.id, editContent)
    }
    setEditingNote(note)
    setEditContent(note.content)
  }

  const handleExportPdf = () => {
    window.print()
  }

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (selectedItemId && n.moduleItemId !== selectedItemId) {
      return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        n.content.toLowerCase().includes(q) ||
        n.moduleItemTitle.toLowerCase().includes(q) ||
        n.moduleName.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Group notes by module
  const notesByModule = new Map<
    string,
    StudentNote[]
  >()
  for (const note of filteredNotes) {
    const existing = notesByModule.get(note.moduleName) ?? []
    existing.push(note)
    notesByModule.set(note.moduleName, existing)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin
          text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 print:space-y-2">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Notebook
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
            {saving && (
              <span className="ml-2 text-xs">Saving...</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportPdf}
          className="min-h-[44px]"
        >
          <FileDown className="h-4 w-4 mr-1" />
          Export as PDF
        </Button>
      </div>

      {/* Search */}
      <div className="relative print:hidden">
        <Search className="absolute left-3 top-1/2
          -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="pl-9 min-h-[44px] w-full sm:w-64"
        />
      </div>

      {/* Main layout: sidebar + notes */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT: Module/Item list */}
        <div className="w-full lg:w-64 shrink-0 print:hidden">
          <div className="rounded-xl border bg-card
            overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold">Modules</p>
            </div>

            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground
                p-4 text-center">
                No modules available
              </p>
            ) : (
              <div className="max-h-[400px] lg:max-h-[600px]
                overflow-y-auto">
                {/* Show all notes option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemId(null)
                    setEditingNote(null)
                  }}
                  className={`w-full text-left px-4 py-2.5
                    text-sm min-h-[44px] flex items-center
                    gap-2 transition-colors
                    ${
                      !selectedItemId
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted/50'
                    }`}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  All Notes
                </button>

                {modules.map((mod) => (
                  <div key={mod.id}>
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className="w-full text-left px-4 py-2.5
                        text-sm font-medium min-h-[44px]
                        flex items-center gap-2
                        hover:bg-muted/50 transition-colors"
                    >
                      {expandedModules.has(mod.id) ? (
                        <ChevronDown className="h-3.5 w-3.5
                          shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5
                          shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">
                        {mod.title}
                      </span>
                    </button>
                    {expandedModules.has(mod.id) &&
                      mod.items.map((item) => {
                        const hasNote = notes.some(
                          (n) => n.moduleItemId === item.id
                        )
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              handleSelectItem(item.id)
                            }
                            className={`w-full text-left pl-10
                              pr-4 py-2 text-sm min-h-[44px]
                              flex items-center gap-2
                              transition-colors
                              ${
                                selectedItemId === item.id
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-muted/50'
                              }`}
                          >
                            {hasNote && (
                              <StickyNote className="h-3 w-3
                                shrink-0 text-amber-500" />
                            )}
                            <span className="truncate">
                              {item.title}
                            </span>
                          </button>
                        )
                      })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Notes content */}
        <div className="flex-1 min-w-0">
          {editingNote ? (
            /* Note editor */
            <div className="rounded-xl border bg-card p-4
              space-y-3 print:border-0 print:p-0">
              <div className="flex items-center justify-between
                print:hidden">
                <div>
                  <p className="font-semibold text-sm">
                    {editingNote.moduleItemTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {editingNote.moduleName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleBlur()
                    setEditingNote(null)
                  }}
                  className="min-h-[44px]"
                >
                  Done
                </Button>
              </div>
              <Textarea
                value={editContent}
                onChange={(e) =>
                  handleEditContentChange(e.target.value)
                }
                onBlur={handleBlur}
                placeholder="Start writing your notes..."
                rows={12}
                className="resize-y min-h-[200px] text-sm
                  leading-relaxed print:hidden"
              />
              {/* Print-friendly view */}
              <div className="hidden print:block whitespace-pre-wrap
                text-sm leading-relaxed">
                {editContent}
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            /* Empty state */
            <div className="rounded-xl border bg-card p-12
              flex flex-col items-center text-center gap-4
              print:hidden">
              <div className="h-12 w-12 rounded-full bg-muted
                flex items-center justify-center">
                <StickyNote className="h-6 w-6
                  text-muted-foreground" />
              </div>
              <p className="font-semibold">
                {selectedItemId
                  ? 'No notes for this item'
                  : 'No notes yet'}
              </p>
              <p className="text-sm text-muted-foreground
                max-w-sm">
                {selectedItemId
                  ? 'Click below to start a new note.'
                  : 'Select a module item from the sidebar to start taking notes.'}
              </p>
              {selectedItemId && (
                <Button
                  onClick={() => createNote(selectedItemId)}
                  className="min-h-[44px]"
                >
                  <StickyNote className="h-4 w-4 mr-1" />
                  New Note
                </Button>
              )}
            </div>
          ) : (
            /* Notes grouped by module */
            <div className="space-y-6">
              {Array.from(notesByModule.entries()).map(
                ([moduleName, moduleNotes]) => (
                  <div key={moduleName} className="space-y-3">
                    <h3 className="text-sm font-semibold
                      text-muted-foreground uppercase
                      tracking-wider print:text-black">
                      {moduleName}
                    </h3>
                    <div className="space-y-2">
                      {moduleNotes.map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleEditNote(note)}
                          className="w-full text-left rounded-lg
                            border bg-card p-4 hover:border-primary/50
                            transition-colors min-h-[56px]
                            print:border-0 print:p-2"
                        >
                          <div className="flex items-start
                            justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium
                                truncate">
                                {note.moduleItemTitle}
                              </p>
                              <p className="text-sm
                                text-muted-foreground
                                line-clamp-2 mt-1
                                print:line-clamp-none
                                print:text-black">
                                {note.content || (
                                  <span className="italic">
                                    Empty note
                                  </span>
                                )}
                              </p>
                            </div>
                            <span className="text-xs
                              text-muted-foreground shrink-0
                              print:hidden">
                              {formatRelativeDate(
                                note.updatedAt
                              )}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Add note for selected item */}
              {selectedItemId &&
                !notes.some(
                  (n) => n.moduleItemId === selectedItemId
                ) && (
                  <Button
                    onClick={() => createNote(selectedItemId)}
                    variant="outline"
                    className="w-full min-h-[44px] print:hidden"
                  >
                    <StickyNote className="h-4 w-4 mr-1" />
                    Add Note for This Item
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
