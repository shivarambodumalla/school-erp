export interface ClassEntry {
    name: string
    gradeLevel: number
    sectionName: string
}

export interface StaffEntry {
    firstName: string
    lastName: string
    email: string
    portalType: 'TEACHER' | 'INSTRUCTOR'
    password: string
}

export interface StudentEntry {
    firstName: string
    lastName: string
    admissionNo: string
    dateOfBirth: string
    gender: 'MALE' | 'FEMALE' | 'OTHER'
    guardianName: string
    guardianPhone: string
}
