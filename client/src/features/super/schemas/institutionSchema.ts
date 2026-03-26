import * as z from 'zod'

export const INDIAN_STATES_LIST = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
] as const

export const addInstitutionSchema = z.object({
  name: z.string().min(2, 'Institution name must be at least 2 characters'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be 30 characters or fewer')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  institutionType: z.enum(['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TRAINING_CENTER'], {
    message: 'Please select an institution type',
  }),
  board_affiliation: z.enum(['CBSE', 'ICSE', 'STATE'], {
    message: 'Please select a board',
  }),
  planTier: z.enum(['STARTER', 'GROWTH', 'PRO'], {
    message: 'Please select a plan',
  }),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.enum(INDIAN_STATES_LIST, {
    message: 'Please select a state',
  }),
  pinCode: z.string()
    .length(6, 'PIN code must be exactly 6 digits')
    .regex(/^\d+$/, 'Must be numbers only'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\d+$/, 'Must be numbers only'),
  email: z.string().email('Please enter a valid email'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  establishedYear: z.number().int().min(1800).max(2100).optional(),
  studentCapacity: z.number().int().min(1).optional(),
})

export type AddInstitutionFormData = z.infer<typeof addInstitutionSchema>
