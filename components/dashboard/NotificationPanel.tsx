'use client'

import { useState, useEffect } from 'react'
import { Bell, ExternalLink, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Notification {
  id: string
  user_id: string
  heading: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function NotificationPanel({ open, onOpenChange, userId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && userId) {
      fetchNotifications()
    }
  }, [open, userId])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
    } catch (error: any) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleLinkClick = (notification: Notification) => {
    if (notification.link) {
      window.open(notification.link, '_blank')
      if (!notification.read) {
        markAsRead(notification.id)
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-muted/30' : 'bg-brand-accent/10 border-brand-accent/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{notification.heading}</h4>
                  {!notification.read && (
                    <Badge className="bg-brand-accent text-white text-xs">New</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex gap-2">
                    {notification.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkClick(notification)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                    )}
                    
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}