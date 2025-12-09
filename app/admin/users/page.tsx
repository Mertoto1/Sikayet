'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [sectors, setSectors] = useState<any[]>([])
    const [selectedSector, setSelectedSector] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const initialUserType = searchParams.get('userType') || 'ALL'
    const [userTypeFilter, setUserTypeFilter] = useState(initialUserType)
    
    // Edit state
    const [editingUser, setEditingUser] = useState<any>(null)
    const [editForm, setEditForm] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        username: ''
    })

    // 2FA state
    const [show2FAModal, setShow2FAModal] = useState(false)
    const [selectedUserFor2FA, setSelectedUserFor2FA] = useState<any>(null)
    const [qrCode, setQrCode] = useState<string>('')
    const [twoFactorSecret, setTwoFactorSecret] = useState<string>('')
    const [loading2FA, setLoading2FA] = useState(false)

    // Complaints modal state
    const [showComplaintsModal, setShowComplaintsModal] = useState(false)
    const [selectedUserComplaints, setSelectedUserComplaints] = useState<any[]>([])
    const [loadingComplaints, setLoadingComplaints] = useState(false)
    const [selectedUserForComplaints, setSelectedUserForComplaints] = useState<any>(null)

    useEffect(() => {
        // Fetch sectors for filter
        fetch('/api/admin/sectors').then(r => r.json()).then(d => setSectors(d.sectors || []))
        fetchUsers()
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [selectedSector, userTypeFilter]) // Add userTypeFilter to dependencies

    function fetchUsers() {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (selectedSector) {
            params.append('sectorId', selectedSector)
        }
        
        if (userTypeFilter !== 'ALL') {
            params.append('userType', userTypeFilter)
        }

        const url = `/api/admin/users?${params.toString()}`

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setUsers(data.users || [])
                setLoading(false)
            })
    }

    // Filter users based on search term and user type
    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true
        const fullName = `${user.name} ${user.surname}`.toLowerCase()
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    })

    function startEditing(user: any) {
        setEditingUser(user)
        setEditForm({
            name: user.name || '',
            surname: user.surname || '',
            email: user.email || '',
            phone: user.phone || '',
            username: user.username || ''
        })
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!editingUser) return

        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                body: JSON.stringify(editForm)
            })
            
            if (res.ok) {
                const data = await res.json()
                setUsers(users.map(u => u.id === editingUser.id ? {...u, ...data.user} : u))
                setEditingUser(null)
                fetchUsers() // Refresh the list
            } else {
                const error = await res.json()
                alert(error.error || 'Güncelleme başarısız')
            }
        } catch (err) {
            alert('Hata oluştu')
        }
    }

    async function handleDelete(userId: number, userName: string) {
        if (!confirm(`Delete user "${userName}"? This will also delete all their complaints.`)) {
            return
        }

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            })
            
            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId))
                fetchUsers() // Refresh the list
            } else {
                const error = await res.json()
                alert(error.error || 'Silme işlemi başarısız')
            }
        } catch (err) {
            alert('Hata oluştu')
        }
    }

    async function handle2FAToggle(user: any) {
        if (user.twoFactorEnabled) {
            // Disable 2FA
            if (!confirm(`${user.name} için 2FA'yı devre dışı bırakmak istediğinizden emin misiniz?`)) {
                return
            }

            try {
                setLoading2FA(true)
                const res = await fetch(`/api/admin/users/${user.id}/2fa`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'disable' })
                })

                const data = await res.json()
                if (res.ok) {
                    alert('2FA başarıyla devre dışı bırakıldı')
                    fetchUsers() // Refresh the list
                } else {
                    alert(data.error || '2FA devre dışı bırakılamadı')
                }
            } catch (err) {
                alert('Hata oluştu')
            } finally {
                setLoading2FA(false)
            }
        } else {
            // Enable 2FA - Generate secret and show QR code
            try {
                setLoading2FA(true)
                setSelectedUserFor2FA(user)
                
                const res = await fetch(`/api/admin/users/${user.id}/2fa`, {
                    method: 'POST'
                })

                const data = await res.json()
                if (res.ok) {
                    setQrCode(data.qrCode)
                    setTwoFactorSecret(data.secret)
                    setShow2FAModal(true)
                } else {
                    alert(data.error || '2FA secret oluşturulamadı')
                }
            } catch (err) {
                alert('Hata oluştu')
            } finally {
                setLoading2FA(false)
            }
        }
    }

    async function confirmEnable2FA() {
        if (!selectedUserFor2FA || !twoFactorSecret) return

        try {
            setLoading2FA(true)
            const res = await fetch(`/api/admin/users/${selectedUserFor2FA.id}/2fa`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'enable', secret: twoFactorSecret })
            })

            const data = await res.json()
            if (res.ok) {
                alert('2FA başarıyla etkinleştirildi')
                setShow2FAModal(false)
                setSelectedUserFor2FA(null)
                setQrCode('')
                setTwoFactorSecret('')
                fetchUsers() // Refresh the list
            } else {
                alert(data.error || '2FA etkinleştirilemedi')
            }
        } catch (err) {
            alert('Hata oluştu')
        } finally {
            setLoading2FA(false)
        }
    }

    async function showUserComplaints(user: any) {
        setSelectedUserForComplaints(user)
        setShowComplaintsModal(true)
        setLoadingComplaints(true)
        
        try {
            const res = await fetch(`/api/admin/users/${user.id}/complaints`)
            const data = await res.json()
            if (res.ok) {
                setSelectedUserComplaints(data.complaints || [])
            } else {
                alert('Şikayetler yüklenemedi')
                setSelectedUserComplaints([])
            }
        } catch (err) {
            alert('Hata oluştu')
            setSelectedUserComplaints([])
        } finally {
            setLoadingComplaints(false)
        }
    }

    async function handleDeleteComplaint(complaintId: string) {
        if (!confirm('Bu şikayeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            return
        }

        try {
            const res = await fetch(`/api/admin/complaints/${complaintId}/delete`, {
                method: 'POST'
            })
            
            if (res.ok) {
                setSelectedUserComplaints(selectedUserComplaints.filter(c => c.id !== complaintId))
                fetchUsers() // Refresh user list to update complaint count
            } else {
                const errorData = await res.json()
                alert('Silme işlemi başarısız: ' + (errorData.error || 'Bilinmeyen hata'))
            }
        } catch (err) {
            alert('Hata oluştu')
        }
    }

    // Export to Excel-CSV function
    function exportToCSV() {
        // Function to replace Turkish characters
        const replaceTurkishChars = (text: string) => {
            return text
                .replace(/İ/g, 'I')
                .replace(/ı/g, 'i')
                .replace(/Ş/g, 'S')
                .replace(/ş/g, 's')
                .replace(/Ç/g, 'C')
                .replace(/ç/g, 'c')
                .replace(/Ğ/g, 'G')
                .replace(/ğ/g, 'g')
                .replace(/Ü/g, 'U')
                .replace(/ü/g, 'u')
                .replace(/Ö/g, 'O')
                .replace(/ö/g, 'o');
        };
        
        // Create CSV content with English headers
        const headers = "ID;Name;Surname;Email;Username;Phone;Role;Complaint Count;Registration Date";
        let csvContent = headers + "\n";
        
        filteredUsers.forEach(user => {
            const row = [
                user.id,
                `"${replaceTurkishChars(user.name || '').replace(/"/g, '""')}"`, // Escape quotes
                `"${replaceTurkishChars(user.surname || '').replace(/"/g, '""')}"`,
                `"${replaceTurkishChars(user.email || '').replace(/"/g, '""')}"`,
                `"${replaceTurkishChars(user.username || '').replace(/"/g, '""')}"`,
                `"${replaceTurkishChars(user.phone || '').replace(/"/g, '""')}"`,
                `"${replaceTurkishChars(user.role === 'ADMIN' ? 'Admin' : user.role === 'COMPANY' ? 'Company' : 'User')}"`,
                user._count?.complaints || 0,
                `"${replaceTurkishChars(new Date(user.createdAt).toLocaleDateString('en-US'))}"`
            ].join(";");
            csvContent += row + "\n";
        });

        // Create blob with proper MIME type
        const blob = new Blob([csvContent], { 
            type: 'text/csv;charset=utf-8' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `users-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        // Check if document.body exists before appending
        if (document.body) {
          document.body.appendChild(link);
        }
        link.click();
        // Check if parentNode exists before trying to remove child
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url); // Clean up
    }

    return (
        <div className="space-y-3 md:space-y-4 max-w-full overflow-x-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    Kullanıcı Yönetimi
                </h1>
                <p className="text-gray-600 text-sm">Kullanıcıları yönetin, düzenleyin veya silin</p>
            </div>

            {/* Modern Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-2 md:p-3 lg:p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filtrele
                    </h2>
                </div>
                <div className="p-3 md:p-4 lg:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı Ara</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder="İsim, e-posta veya kullanıcı adı..."
                                />
                            </div>
                        </div>

                        {/* Sector Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sektöre Göre Filtrele</label>
                            <select
                                value={selectedSector}
                                onChange={e => setSelectedSector(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            >
                                <option value="">Tüm Kullanıcılar</option>
                                {sectors.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name} Şikayetçileri</option>
                                ))}
                            </select>
                        </div>

                        {/* Export Button */}
                        <div className="flex items-end">
                            <button
                                onClick={exportToCSV}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                CSV Olarak Dışa Aktar
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {searchTerm && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    Arama: "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-2 inline-flex-shrink-0 h-4 w-4 rounded-full opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            )}
                            {selectedSector && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    Sektör: {sectors.find(s => s.id === selectedSector)?.name}
                                    <button
                                        onClick={() => setSelectedSector('')}
                                        className="ml-2 inline-flex-shrink-0 h-4 w-4 rounded-full opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            )}
                        </div>
                        
                        {/* Clear Filters Button */}
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    setSelectedSector('')
                                    setSearchTerm('')
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Filtreleri Temizle
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Kullanıcıyı Düzenle</h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="overflow-y-auto p-6 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Ad"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                                    <input
                                        type="text"
                                        value={editForm.surname}
                                        onChange={e => setEditForm({...editForm, surname: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Soyad"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="E-posta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={e => setEditForm({...editForm, username: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Kullanıcı adı"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Telefon"
                                    />
                                </div>
                            </div>
                        </form>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Güncelle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">ID</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">Ad Soyad</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">Kullanıcı Adı</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">E-posta</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">Telefon</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">Rol</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">2FA</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">Şikayet Sayısı</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">Şikayetler</th>
                                <th className="text-left py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">Son Şikayet</th>
                                <th className="text-right py-3 px-3 md:px-4 lg:px-5 font-semibold text-gray-700 text-sm">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="py-12 px-3 md:px-4 lg:px-5 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                            <p className="text-gray-600">Yükleniyor...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-12 px-3 md:px-4 lg:px-5 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">Kullanıcı bulunamadı</h3>
                                            <p className="text-gray-500">Filtrelerinizi değiştirmeyi deneyin</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-3 md:px-4 lg:px-5 text-sm font-medium text-gray-900">#{user.id}</td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5 text-sm text-gray-600">
                                            @{user.username || '-'}
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5 text-sm text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5 text-sm text-gray-600">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'ADMIN' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : user.role === 'COMPANY' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.role === 'ADMIN' ? 'Yönetici' : user.role === 'COMPANY' ? 'Şirket' : 'Kullanıcı'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.twoFactorEnabled 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {user.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5 text-sm text-gray-900 font-semibold">
                                            {user._count.complaints}
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5">
                                            <button
                                                onClick={() => showUserComplaints(user)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                                disabled={user._count.complaints === 0}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                Şikayetler ({user._count.complaints})
                                            </button>
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5 text-sm text-gray-600">
                                            {user.complaints[0] ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {user.complaints[0].company.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 md:px-4 lg:px-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handle2FAToggle(user)}
                                                    disabled={loading2FA}
                                                    className={`p-2 rounded-lg transition ${
                                                        user.twoFactorEnabled
                                                            ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                                                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                                    } ${loading2FA ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={user.twoFactorEnabled ? '2FA Devre Dışı Bırak' : '2FA Etkinleştir'}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => startEditing(user)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Düzenle"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                                    title="Sil"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2FA QR Code Modal */}
            {show2FAModal && selectedUserFor2FA && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">2FA Etkinleştir</h3>
                            <button
                                onClick={() => {
                                    setShow2FAModal(false)
                                    setSelectedUserFor2FA(null)
                                    setQrCode('')
                                    setTwoFactorSecret('')
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-gray-600 mb-4">
                                    <strong>{selectedUserFor2FA.name}</strong> için 2FA'yı etkinleştirmek üzere QR kodunu tarayın:
                                </p>
                                {qrCode && (
                                    <div className="flex justify-center mb-4">
                                        <img src={qrCode} alt="QR Code" className="w-64 h-64 border-2 border-gray-200 rounded-lg" />
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mb-4">
                                    Authenticator uygulamanızla (Google Authenticator, Microsoft Authenticator vb.) QR kodu tarayın.
                                </p>
                                {twoFactorSecret && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                        <p className="text-xs text-gray-600 mb-1">Manuel giriş için secret:</p>
                                        <code className="text-xs font-mono text-gray-800 break-all">{twoFactorSecret}</code>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShow2FAModal(false)
                                    setSelectedUserFor2FA(null)
                                    setQrCode('')
                                    setTwoFactorSecret('')
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmEnable2FA}
                                disabled={loading2FA}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading2FA ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Etkinleştiriliyor...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        2FA'yı Etkinleştir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complaints Modal */}
            {showComplaintsModal && selectedUserForComplaints && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {selectedUserForComplaints.name} {selectedUserForComplaints.surname} - Şikayetler
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{selectedUserForComplaints.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowComplaintsModal(false)
                                    setSelectedUserForComplaints(null)
                                    setSelectedUserComplaints([])
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-6">
                            {loadingComplaints ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                    <p className="text-gray-600">Yükleniyor...</p>
                                </div>
                            ) : selectedUserComplaints.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Henüz şikayet yok</h3>
                                    <p className="text-gray-500">Bu kullanıcının henüz şikayeti bulunmuyor</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedUserComplaints.map((complaint: any) => (
                                        <div key={complaint.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {complaint.company.logoUrl && (
                                                            <img 
                                                                src={complaint.company.logoUrl} 
                                                                alt={complaint.company.name}
                                                                className="w-8 h-8 rounded-lg object-contain bg-white p-1 border flex-shrink-0"
                                                            />
                                                        )}
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                                            {complaint.company.name}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                            complaint.status === 'PENDING_MODERATION' ? 'bg-orange-100 text-orange-800' :
                                                            complaint.status === 'SOLVED' ? 'bg-green-100 text-green-800' :
                                                            complaint.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {complaint.status === 'PENDING_MODERATION' ? 'Bekliyor' :
                                                             complaint.status === 'SOLVED' ? 'Çözüldü' :
                                                             complaint.status === 'PUBLISHED' ? 'Yayınlandı' :
                                                             complaint.status === 'REJECTED' ? 'Reddedildi' : complaint.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{complaint.title}</h4>
                                                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{complaint.content}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                                                        </span>
                                                        {complaint._count && (
                                                            <>
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                    </svg>
                                                                    {complaint._count.responses} Yanıt
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                                    </svg>
                                                                    {complaint._count.reviews} Değerlendirme
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 flex-shrink-0">
                                                    <Link
                                                        href={`/admin/complaints/${complaint.id}`}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors text-center"
                                                    >
                                                        Detay
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteComplaint(complaint.id)}
                                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}