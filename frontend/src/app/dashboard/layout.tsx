"use client"

import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { UploadProvider } from "@/contexts/UploadContext"
import { UploadWidget } from "@/components/admin/UploadWidget"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UploadProvider>
            <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
                <Header />

                <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
                    <Sidebar />

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 p-4 md:p-8">
                        {children}
                    </main>
                </div>
                <UploadWidget />
            </div>
        </UploadProvider>
    )
}
