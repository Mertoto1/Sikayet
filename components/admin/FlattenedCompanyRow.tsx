'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FlattenedCompanyRow({ company }: { company: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleToggle(status: boolean) {
        if (!confirm(status ? 'Şirketi onaylamak istiyor musunuz?' : 'Şirketi askıya almak istiyor musunuz?')) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/companies/${company.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ isApproved: status })
            })
            if (res.ok) {
                router.refresh()
            } else {
                alert('İşlem başarısız.')
            }
        } catch (err) {
            console.error(err)
            alert('Hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <tr className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
            <td className="p-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-xs font-bold text-gray-400">{company.name.substring(0, 2)}</span>
                    )}
                </div>
            </td>
            <td className="p-4 text-sm font-bold text-gray-900">{company.name}</td>
            <td className="p-4 text-sm text-gray-600">{company.sector?.name}</td>
            <td className="p-4">
                {company.isApproved ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Onaylı</span>
                ) : (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold">Onay Bekliyor</span>
                )}
            </td>
            <td className="p-4 text-right whitespace-nowrap">
                <div className="flex justify-end gap-2">
                    {!company.isApproved && (
                        <button onClick={() => handleToggle(true)} disabled={loading} className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-bold transition disabled:opacity-50">ONAYLA</button>
                    )}
                    {company.isApproved && (
                        <button onClick={() => handleToggle(false)} disabled={loading} className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-bold transition disabled:opacity-50">ASKIYA AL</button>
                    )}
                </div>
            </td>
        </tr>
    )
}
