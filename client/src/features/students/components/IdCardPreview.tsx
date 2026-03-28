'use client'

import { getAvatarColor } from '@/lib/colors'

interface Props {
    student: {
        firstName: string; middleName: string | null; lastName: string
        sisId: string; admissionNo: string; rollNo: string | null
        photoUrl: string | null; bloodGroup: string | null
        class: { name: string }; section: { name: string }
    }
    institution: { name: string; logoUrl: string | null; primaryColor: string }
    validTill?: string
}

export function IdCardPreview({ student: s, institution, validTill }: Props) {
    const fullName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')
    const initials = `${s.firstName[0] ?? ''}${s.lastName[0] ?? ''}`.toUpperCase()
    const validDate = validTill
        ? new Date(validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—'

    return (
        <div className="w-[320px] rounded-xl shadow-lg overflow-hidden border text-xs print:w-[85mm]">
            {/* Top — school branding */}
            <div className="px-4 py-3 text-white text-center"
                style={{ backgroundColor: institution.primaryColor }}>
                {institution.logoUrl ? (
                    <img src={institution.logoUrl} alt="" className="h-8 mx-auto mb-1 object-contain" />
                ) : (
                    <p className="font-bold text-sm">{institution.name}</p>
                )}
                <p className="text-[10px] tracking-wider opacity-80 uppercase">Student Identity Card</p>
            </div>

            {/* Middle — student info */}
            <div className="px-4 py-3 flex gap-3 items-start bg-white">
                {s.photoUrl ? (
                    <img src={s.photoUrl} alt="" className="h-[60px] w-[60px] rounded-full object-cover shrink-0" />
                ) : (
                    <div className={`h-[60px] w-[60px] rounded-full flex items-center justify-center
                        text-white text-lg font-bold shrink-0 ${getAvatarColor(s.firstName)}`}>
                        {initials}
                    </div>
                )}
                <div className="min-w-0 space-y-0.5">
                    <p className="font-bold text-sm truncate">{fullName}</p>
                    <Row label="SIS ID" value={s.sisId} />
                    <Row label="Adm No" value={s.admissionNo} />
                    <Row label="Class" value={`${s.class.name} | ${s.section.name}`} />
                    {s.bloodGroup && (
                        <p className="text-red-600 font-bold">Blood: {s.bloodGroup}</p>
                    )}
                </div>
            </div>

            {/* Bottom — roll no, valid till, QR placeholder */}
            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                <div className="space-y-0.5">
                    {s.rollNo && <Row label="Roll No" value={s.rollNo} />}
                    <Row label="Valid Till" value={validDate} />
                    <p className="text-[9px] text-muted-foreground mt-1">{institution.name}</p>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center
                    text-[8px] text-muted-foreground font-mono shrink-0">
                    QR
                </div>
            </div>
        </div>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <p><span className="text-muted-foreground">{label}: </span><span className="font-medium">{value}</span></p>
    )
}
