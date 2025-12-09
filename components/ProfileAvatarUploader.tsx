'use client'

import { useState, useRef } from 'react'

export default function ProfileAvatarUploader({ currentAvatar, userName }: { currentAvatar?: string | null, userName?: string | null }) {
    const [avatar, setAvatar] = useState(currentAvatar)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            // Since we don't have a real active S3, we will simulate or use a base64 approach / local stub?
            // The plan said "Sftp/S3 Integration (Implemented)". 
            // Checking task.md: "- [x] Storage: Replace Mock Upload with S3/R2 Integration (Implemented)"
            // So /api/upload should work.

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            setAvatar(data.url)

            // Auto update profile avatar field too? 
            // The form below uses name="avatar" input. We should update that input value if it exists or just rely on form submission?
            // User still needs to click "Save". 
            // Let's update the hidden input value so when they click save it submits the new URL.

            const urlInput = document.querySelector('input[name="avatar"]') as HTMLInputElement
            if (urlInput) urlInput.value = data.url

        } catch (error) {
            console.error(error)
            alert('Resim yüklenirken hata oluştu')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="mb-8 text-center relative max-w-xs mx-auto">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            <div className="inline-block relative">
                {avatar ? (
                    <img
                        src={avatar}
                        alt={userName || 'Avatar'}
                        className={`w-32 h-32 rounded-full object-cover shadow-xl ring-4 ring-white mx-auto ${uploading ? 'opacity-50' : ''}`}
                    />
                ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-white mx-auto">
                        {userName?.charAt(0) || 'U'}
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-indigo-600 transition cursor-pointer"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Rsim seçmek için ikona tıklayın</p>
        </div>
    )
}
