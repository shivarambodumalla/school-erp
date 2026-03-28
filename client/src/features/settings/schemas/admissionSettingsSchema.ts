import { z } from 'zod'

export const numberFormatsSchema = z.object({
    admissionNoPrefix: z.string().max(5),
    admissionNoCurrentSeq: z.number().int().min(1),
    rollNoPrefix: z.string().max(5),
    rollNoCurrentSeq: z.number().int().min(1),
    appNoPrefix: z.string().max(5),
    appNoCurrentSeq: z.number().int().min(1),
})

export const idProofTypesSchema = z.object({
    acceptedIdProofTypes: z.array(z.string()).min(1, 'Select at least one ID proof type'),
})

export const documentTypeSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    isRequired: z.boolean().default(false),
    acceptedFormats: z.array(z.string()).default(['PDF', 'JPEG', 'PNG']),
    showInAdmission: z.boolean().default(true),
    showInProfile: z.boolean().default(true),
})

export const documentTypeUpdateSchema = documentTypeSchema.partial().extend({
    order: z.number().int().min(0).optional(),
})

export type NumberFormatsData = z.infer<typeof numberFormatsSchema>
export type IdProofTypesData = z.infer<typeof idProofTypesSchema>
export type DocumentTypeData = z.infer<typeof documentTypeSchema>
export type DocumentTypeUpdateData = z.infer<typeof documentTypeUpdateSchema>
