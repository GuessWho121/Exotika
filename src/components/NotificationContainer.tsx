"use client"

import { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, ShoppingBag } from 'lucide-react'
import { useNotifications, type Notification } from "../contexts/NotificationContext"

export function NotificationContainer() {
  const { state, removeNotification } = useNotifications()

  useEffect(() => {
    // Auto-remove notifications after their duration
    state.notifications.forEach((notification: Notification) => {
      if (notification.duration !== 0) { // 0 means persistent
        const duration = notification.duration || 5000
        const timer = setTimeout(() => {
          removeNotification(notification.id)
        }, duration)

        return () => clearTimeout(timer)
      }
    })
  }, [state.notifications, removeNotification])

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <ShoppingBag className="h-5 w-5 text-[#4A3F00]" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-[#FFFBEB] border-[#FFDE59]"
    }
  }

  if (state.notifications.length === 0) return null

  return (
    <div className="fixed right-4 top-20 z-50 space-y-2 w-80">
      {state.notifications.map((notification: Notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out animate-in slide-in-from-right ${getStyles(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#4A3F00]">
                {notification.title}
              </h4>
              <p className="mt-1 text-sm text-[#8C7B00]">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 rounded-full p-1 text-[#8C7B00] hover:text-[#4A3F00] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
