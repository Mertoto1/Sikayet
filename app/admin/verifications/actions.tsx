'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerificationActionButtons({ id }: { id: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleAction(action: 'APPROVE' | 'REJECT') {
        if (!confirm(action === 'APPROVE' ? 'Bu kullanıcıyı şirket yetkilisi olarak onaylıyor musunuz?' : 'Reddetmek istediğinize emin misiniz?')) return

        setLoading(true)
        try {
            const res = await fetch('/api/admin/verifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: action })
            })

            if (!res.ok) throw new Error('İşlem başarısız')

            router.refresh()
        } catch (e) {
            alert('Hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => handleAction('REJECT')}
                disabled={loading}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition"
            >
                Reddet
            </button>
            <button
                onClick={() => handleAction('APPROVE')}
                disabled={loading}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition"
            >
                Onayla
            </button>
        </div>
    )
}
