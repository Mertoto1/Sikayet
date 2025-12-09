'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MarkAsSolvedButton({ complaintId, isSolved }: { complaintId: string, isSolved: boolean }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleMarkAsSolved = async () => {
        if (loading) return
        
        if (!confirm('Bu şikayeti çözüldü olarak işaretlemek istediğinize emin misiniz?')) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/complaints/${complaintId}/mark-solved`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to mark as solved')
            }

            // Refresh the page to show updated status
            router.refresh()
        } catch (error: any) {
            alert(error.message || 'Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    if (isSolved) {
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Çözüldü
            </span>
        )
    }

    return (
        <button
            onClick={handleMarkAsSolved}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
        >
            {loading ? (
                <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İşleniyor...
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Çözüldü Olarak İşaretle
                </>
            )}
        </button>
    )
}