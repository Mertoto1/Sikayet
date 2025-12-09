'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProfileAvatarUploader from '@/components/ProfileAvatarUploader'

export default function EditProfileForm({ user }: { user: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Değişiklikler başarıyla kaydedildi')
                router.refresh()
            } else {
                toast.error(data.error || 'Bir hata oluştu')
            }
        } catch (error) {
            toast.error('Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8">
                {/* Avatar Section */}
                <ProfileAvatarUploader currentAvatar={user?.avatar} userName={user?.name} />

                {/* Avatar URL (hidden for future image upload) */}
                <input
                    type="hidden"
                    name="avatar"
                    defaultValue={user?.avatar || ''}
                />

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={user?.name || ''}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Adınız"
                        />
                    </div>

                    {/* Surname */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Soyad
                        </label>
                        <input
                            type="text"
                            name="surname"
                            defaultValue={user?.surname || ''}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Soyadınız"
                        />
                    </div>
                </div>

                {/* Username */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kullanıcı Adı
                    </label>
                    <input
                        type="text"
                        name="username"
                        defaultValue={user?.username || ''}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="kullanici_adi"
                    />
                </div>

                {/* Email (readonly) */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        E-posta
                    </label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                </div>

                {/* Phone */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefon
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={user?.phone || ''}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="+90 5xx xxx xx xx"
                    />
                </div>

                {/* Bio */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hakkımda
                    </label>
                    <textarea
                        name="bio"
                        rows={4}
                        defaultValue={user?.bio || ''}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                        placeholder="Kendiniz hakkında birkaç kelime..."
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Link
                    href="/profile"
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all border border-gray-300 text-center"
                >
                    İptal
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                    {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>
        </form>
    )
}
