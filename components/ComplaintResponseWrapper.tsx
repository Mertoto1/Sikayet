'use client'

import { useState } from 'react'
import ResponseModal from './ResponseModal'

interface ComplaintResponseWrapperProps {
    complaintId: string
    children: React.ReactNode
}

export default function ComplaintResponseWrapper({ complaintId, children }: ComplaintResponseWrapperProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <div onClick={() => setIsModalOpen(true)}>
                {children}
            </div>
            <ResponseModal 
                complaintId={complaintId} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    )
}
