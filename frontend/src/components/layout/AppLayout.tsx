import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas flex text-slateText-main">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
