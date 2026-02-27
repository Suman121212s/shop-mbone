'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  mobile_no: string
  city: string
  state: string
  country: string
  created_at: string
}

interface UserListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserList({ open, onOpenChange }: UserListProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile_no?.includes(searchTerm)
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const getFullName = (user: UserProfile) => {
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    return `${firstName} ${lastName}`.trim() || 'No Name'
  }

  const getLocation = (user: UserProfile) => {
    const parts = [user.city, user.state, user.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No Location'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            All Users ({filteredUsers.length})
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search */}
          <Input
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* User List */}
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users found matching your search' : 'No users found'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{getFullName(user)}</h4>
                      <p className="text-xs text-muted-foreground">
                        ID: {user.id.slice(-8)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{user.email}</span>
                      </div>
                    )}
                    
                    {user.mobile_no && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.mobile_no}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">{getLocation(user)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}