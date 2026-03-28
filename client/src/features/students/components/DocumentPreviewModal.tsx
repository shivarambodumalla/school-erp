'use client'

import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    documentType: string
    studentName: string
    student: {
        sisId: string; admissionNo: string
        class: { name: string }; section: { name: string }
    }
    institution: {
        name: string; logoUrl: string | null
        addressLine1: string | null; city: string | null
        state: string | null; pinCode: string | null; phone: string | null
    }
    onClose: () => void
}

export function DocumentPreviewModal({ documentType, studentName, student, institution, onClose }: Props) {
    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    })
    const address = [institution.addressLine1, institution.city, institution.state, institution.pinCode]
        .filter(Boolean).join(', ')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b no-print">
                    <h3 className="font-semibold">{documentType}</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Document body */}
                <div id="document-print" className="p-8 space-y-6 text-sm print:p-12">
                    {/* Letterhead */}
                    <div className="text-center border-b pb-4 space-y-1">
                        {institution.logoUrl && (
                            <img src={institution.logoUrl} alt="" className="h-12 mx-auto mb-2" />
                        )}
                        <h2 className="text-lg font-bold">{institution.name}</h2>
                        {address && <p className="text-xs text-muted-foreground">{address}</p>}
                        {institution.phone && <p className="text-xs text-muted-foreground">Phone: {institution.phone}</p>}
                    </div>

                    {/* Title */}
                    <h3 className="text-center text-base font-bold underline underline-offset-4 uppercase">
                        {documentType}
                    </h3>

                    {/* Body */}
                    <div className="leading-relaxed space-y-3">
                        <p>
                            This is to certify that <strong>{studentName}</strong> (SIS ID: {student.sisId},
                            Admission No: {student.admissionNo}) is/was a bonafide student of{' '}
                            <strong>{institution.name}</strong>, studying in Class{' '}
                            <strong>{student.class.name}</strong>, Section <strong>{student.section.name}</strong>.
                        </p>
                        <p>
                            This certificate is issued on request for whatever purpose it may serve.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-12 flex justify-between items-end">
                        <div className="text-center space-y-1">
                            <div className="h-12 w-24 border-b border-dashed" />
                            <p className="text-xs text-muted-foreground">School Stamp</p>
                        </div>
                        <div className="text-center space-y-1">
                            <div className="h-12 w-32 border-b border-dashed" />
                            <p className="text-xs text-muted-foreground">Principal Signature</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">Date: {today}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 p-4 border-t no-print">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    <Button onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" />Download PDF
                    </Button>
                </div>
            </div>
        </div>
    )
}
