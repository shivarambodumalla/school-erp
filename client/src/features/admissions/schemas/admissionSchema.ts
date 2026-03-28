import { z } from 'zod'

export const createAdmissionSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  academicYearId: z.string().min(1, 'Academic year is required'),
  admissionType: z.enum(['NEW', 'TRANSFER']),
  middleName: z.string().optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  motherTongue: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  previousSchoolName: z.string().optional(),
  previousClass: z.string().optional(),
  previousTCNumber: z.string().optional(),
  photoUrl: z.string().optional(),
  customFieldValues: z.record(z.string(), z.string()).optional(),
})

export const updateAdmissionSchema = createAdmissionSchema.partial()

export const statusTransitionSchema = z.object({
  action: z.enum(['ADMIT', 'ENROLL', 'REJECT']),
  reason: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
})

export const createGuardianSchema = z.object({
  type: z.enum(['FATHER', 'MOTHER', 'GUARDIAN']),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.string().optional(),
  isPrimaryContact: z.boolean().default(false),
  isEmergencyContact: z.boolean().default(false),
  canLogin: z.boolean().default(false),
})

export const updateGuardianSchema = createGuardianSchema.partial()

export const createInquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  source: z.enum(['WALK_IN', 'PHONE', 'WEBSITE', 'REFERRAL', 'OTHER']).default('WALK_IN'),
  notes: z.string().optional(),
})

export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>
export type CreateGuardianInput = z.infer<typeof createGuardianSchema>
export type CreateInquiryInput = z.infer<typeof createInquirySchema>
