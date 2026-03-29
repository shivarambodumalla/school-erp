export interface StudentGuardian {
    id: string
    type: string
    relationship: string | null
    name: string
    phone: string
    alternatePhone: string | null
    email: string | null
    isPrimaryContact: boolean
    isEmergencyContact: boolean
    canLogin: boolean
    userId: string | null
}

export interface StudentProfile {
    id: string
    sisId: string
    admissionNo: string
    rollNo: string | null
    status: string
    photoUrl: string | null
    firstName: string
    middleName: string | null
    lastName: string
    dateOfBirth: string
    gender: string
    bloodGroup: string | null
    nationality: string | null
    religion: string | null
    motherTongue: string | null
    idProofType: string | null
    idProofNumber: string | null
    createdAt: string
    allergies: string[]
    medicalConditions: unknown
    emergencyDoctorName: string | null
    emergencyDoctorPhone: string | null
    transportMode: string
    busRouteId: string | null
    pickupStop: string | null
    dropStop: string | null
    boardingType: string
    hostelRoom: string | null
    sections: {
        section: { id: string; name: string }
        classYear: {
            id: string
            academicYearId: string
            classTemplate: { id: string; name: string; gradeLevel: number }
        }
    }[]
    admission: {
        id: string; applicationNo: string
        admissionNo: string | null; admissionType: string
    } | null
    guardians: StudentGuardian[]
}
