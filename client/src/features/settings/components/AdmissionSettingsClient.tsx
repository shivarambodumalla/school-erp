'use client'

import { NumberFormatsCard } from './NumberFormatsCard'
import { IdProofTypesCard } from './IdProofTypesCard'
import { DocumentTypesCard } from './DocumentTypesCard'

interface AdmissionSettings {
    id: string
    admissionNoPrefix: string
    admissionNoCurrentSeq: number
    rollNoPrefix: string
    rollNoCurrentSeq: number
    appNoPrefix: string
    appNoCurrentSeq: number
    acceptedIdProofTypes: string[]
}

interface DocumentTypeConfig {
    id: string
    name: string
    isRequired: boolean
    acceptedFormats: string[]
    showInAdmission: boolean
    showInProfile: boolean
    order: number
}

interface Props {
    settings: AdmissionSettings
    documentTypes: DocumentTypeConfig[]
}

export function AdmissionSettingsClient({ settings, documentTypes }: Props) {
    return (
        <div className="space-y-6 max-w-3xl">
            <NumberFormatsCard settings={settings} />
            <IdProofTypesCard acceptedTypes={settings.acceptedIdProofTypes} />
            <DocumentTypesCard initialDocTypes={documentTypes} />
        </div>
    )
}
