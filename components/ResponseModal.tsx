'use client'

import { useState } from 'react'

export default function ResponseModal({ complaintId, isOpen, onClose }: { 
    complaintId: string, 
    isOpen: boolean, 
    onClose: () => void 
}) {
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
                onClose()
                window.location.reload()
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Şikayete Yanıt Ver</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yanıtınız
                        </label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            rows={6}
                            placeholder="Müşteriye resmi yanıtınızı yazın..."
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition font-medium disabled:opacity-50"
                        >
                            {loading ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
