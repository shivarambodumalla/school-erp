import { z } from 'zod'

/* ─── Enums (mirror Prisma) ─── */

export const LeadSourceEnum = z.enum([
  'WALK_IN', 'WEBSITE', 'SOCIAL', 'REFERRAL', 'OTHER',
])

export const LeadStatusEnum = z.enum([
  'NEW', 'CONTACTED', 'INTERESTED', 'APPLIED', 'CONVERTED', 'LOST',
])

export const FollowUpChannelEnum = z.enum([
  'CALL', 'WHATSAPP', 'EMAIL', 'SMS',
])

/* ─── Create Lead ─── */

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().min(5, 'Phone is required').max(20),
  email: z.string().email().max(200).optional().or(z.literal('')),
  source: LeadSourceEnum.optional(),
  targetClassId: z.string().cuid().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  assignedToId: z.string().cuid().optional().or(z.literal('')),
  labelId: z.string().cuid().optional().or(z.literal('')),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>

/* ─── Update Lead ─── */

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(5).max(20).optional(),
  email: z.string().email().max(200).optional().nullable(),
  status: LeadStatusEnum.optional(),
  source: LeadSourceEnum.optional(),
  targetClassId: z.string().cuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  assignedToId: z.string().cuid().optional().nullable(),
  labelId: z.string().cuid().optional().nullable(),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>

/* ─── Create Follow-Up ─── */

export const createFollowUpSchema = z.object({
  channel: FollowUpChannelEnum,
  scheduledAt: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>

/* ─── Complete Follow-Up ─── */

export const completeFollowUpSchema = z.object({
  outcome: z.string().max(2000).optional().or(z.literal('')),
})

export type CompleteFollowUpInput = z.infer<typeof completeFollowUpSchema>

/* ─── Create Label ─── */

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
})

export type CreateLabelInput = z.infer<typeof createLabelSchema>

/* ─── Public Enquiry Form ─── */

export const publicEnquirySchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(200),
  dob: z.string().min(1, 'Date of birth is required'),
  targetClassName: z.string().min(1, 'Target class is required').max(100),
  parentName: z.string().min(1, 'Parent name is required').max(200),
  parentPhone: z.string().min(5, 'Phone is required').max(20),
  parentEmail: z.string().email().max(200).optional().or(z.literal('')),
  source: LeadSourceEnum.optional(),
  message: z.string().max(2000).optional().or(z.literal('')),
})

export type PublicEnquiryInput = z.infer<typeof publicEnquirySchema>

/* ─── CSV Import row ─── */

export const csvLeadRowSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal('')),
  source: LeadSourceEnum.optional(),
  targetClass: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type CsvLeadRow = z.infer<typeof csvLeadRowSchema>
