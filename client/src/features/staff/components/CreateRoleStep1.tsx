'use client'

import { ArrowRight } from 'lucide-react'
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
import type { StaffRoleListItem } from '../types'

interface CreateRoleStep1Props {
  name: string
  description: string
  templateId: string
  existingRoles: StaffRoleListItem[]
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onTemplateChange: (v: string) => void
  onNext: () => void
}

export function CreateRoleStep1({
  name,
  description,
  templateId,
  existingRoles,
  onNameChange,
  onDescriptionChange,
  onTemplateChange,
  onNext,
}: CreateRoleStep1Props) {
  return (
    <div className="mt-6 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="role-name">Role Name</Label>
        <Input
          id="role-name"
          placeholder="e.g. Head of Department"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          className="min-h-[44px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role-desc">Description (optional)</Label>
        <Textarea
          id="role-desc"
          placeholder="Briefly describe this role..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Clone permissions from</Label>
        <Select value={templateId} onValueChange={onTemplateChange}>
          <SelectTrigger className="min-h-[44px]">
            <SelectValue placeholder="Start from scratch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Start from scratch</SelectItem>
            {existingRoles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
                {r.isSystemRole ? ' (System)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onNext} className="w-full min-h-[44px] gap-1.5">
        Next <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
