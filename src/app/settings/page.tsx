"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useTheme } from "@/contexts/ThemeContext"

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("twoFAEnabled")
    if (saved) setTwoFAEnabled(saved === "true")
  }, [])

  const handle2FAToggle = () => {
    const next = !twoFAEnabled
    setTwoFAEnabled(next)
    localStorage.setItem("twoFAEnabled", String(next))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage preferences and account options.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current: {theme}</p>
            </div>
            <button onClick={toggleTheme} className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              Toggle Theme
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">2FA Simulation</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Simulate enabling two-factor authentication.</p>
            </div>
            <button onClick={handle2FAToggle} className={`px-4 py-2 rounded-md ${twoFAEnabled ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`}>
              {twoFAEnabled ? "Enabled" : "Enable"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


