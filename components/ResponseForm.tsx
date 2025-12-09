'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResponseForm({ complaintId }: { complaintId: string }) {
    const router = useRouter()
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/complaints/${complaintId}/response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('')
                router.refresh()
            } else {
                setError(data.error || 'Bir hata oluştu')
            }
        } catch (err) {
            console.error(err)
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-4">Firma Yanıtı Yaz</h4>
            {error && (
                <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-amber-800 text-sm">{error}</p>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full p-4 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                    rows={4}
                    placeholder="Müşteriye resmi yanıtınızı yazın..."
                    required
                ></textarea>
                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn btn-primary"
                    >
                        {loading ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
                    </button>
                </div>
            </form>
        </div>
    )
}