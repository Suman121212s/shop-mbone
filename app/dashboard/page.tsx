'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, CreditCard, Heart, Bell, Package, History, ShoppingCart, Wallet, Edit, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { NotificationPanel } from '@/components/dashboard/NotificationPanel'
import { UserList } from '@/components/dashboard/UserList'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  mobile_no: string
  address_1: string
  address_2: string
  address_3: string
  address_4: string
  address_5: string
  pincode: string
  city: string
  state: string
  country: string
  flat_building_no: string
  nearest_location: string
  wallet_balance: number
  blockchain_name: string
}

interface DashboardStats {
  cartItems: number
  unpaidOrders: number
  orderHistory: number
  likedItems: number
  notifications: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    cartItems: 0,
    unpaidOrders: 0,
    orderHistory: 0,
    likedItems: 0,
    notifications: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchDashboardStats()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
    } else if (data) {
      setProfile(data)
      setEditedProfile(data)
    } else {
      // Create default profile
      const defaultProfile = {
        id: user.id,
        email: user.email || '',
        first_name: '',
        last_name: '',
        mobile_no: '',
        address_1: '',
        address_2: '',
        address_3: '',
        address_4: '',
        address_5: '',
        pincode: '',
        city: '',
        state: '',
        country: '',
        flat_building_no: '',
        nearest_location: '',
        wallet_balance: 0,
        blockchain_name: 'Polygon'
      }
      setProfile(defaultProfile)
      setEditedProfile(defaultProfile)
    }
    setLoading(false)
  }

  const fetchDashboardStats = async () => {
    if (!user) return

    try {
      // Fetch cart items count
      const { count: cartCount } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch unpaid orders count
      const { count: unpaidCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')

      // Fetch total orders count
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch liked items count
      const { count: likedCount } = await supabase
        .from('liked_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch notifications count
      const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setStats({
        cartItems: cartCount || 0,
        unpaidOrders: unpaidCount || 0,
        orderHistory: totalOrders || 0,
        likedItems: likedCount || 0,
        notifications: notificationCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...editedProfile,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setProfile(editedProfile as UserProfile)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-secondary mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary mb-2">
          {getGreeting()}, {profile?.first_name || 'User'}!
        </h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile & Wallet */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? <Save className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={editedProfile.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={editedProfile.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editedProfile.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={true}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile_no">Mobile Number</Label>
                  <Input
                    id="mobile_no"
                    value={editedProfile.mobile_no || ''}
                    onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flat_building_no">Flat/Building No</Label>
                    <Input
                      id="flat_building_no"
                      value={editedProfile.flat_building_no || ''}
                      onChange={(e) => handleInputChange('flat_building_no', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nearest_location">Nearest Location</Label>
                    <Input
                      id="nearest_location"
                      value={editedProfile.nearest_location || ''}
                      onChange={(e) => handleInputChange('nearest_location', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num}>
                    <Label htmlFor={`address_${num}`}>Address {num}</Label>
                    <Input
                      id={`address_${num}`}
                      value={editedProfile[`address_${num}` as keyof UserProfile] as string || ''}
                      onChange={(e) => handleInputChange(`address_${num}` as keyof UserProfile, e.target.value)}
                      disabled={!isEditing}
                      placeholder={num === 1 ? 'Required' : 'Optional'}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={editedProfile.pincode || ''}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editedProfile.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editedProfile.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editedProfile.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile} className="bg-brand-accent hover:bg-brand-accent/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-accent/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-brand-accent">
                    {profile?.wallet_balance?.toFixed(2) || '0.00'} MBONE
                  </p>
                </div>
                <div className="bg-brand-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Blockchain</p>
                  <p className="text-lg font-semibold text-brand-primary">
                    {profile?.blockchain_name || 'Polygon'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/cart'}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({stats.cartItems})
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/orders'}
              >
                <Package className="h-4 w-4 mr-2" />
                Unpaid Orders ({stats.unpaidOrders})
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/orders'}
              >
                <History className="h-4 w-4 mr-2" />
                Order History ({stats.orderHistory})
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/liked-items'}
              >
                <Heart className="h-4 w-4 mr-2" />
                Liked Items ({stats.likedItems})
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {stats.notifications > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {stats.notifications}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.notifications > 0 
                  ? `You have ${stats.notifications} unread notifications`
                  : 'No new notifications'
                }
              </p>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUserList(true)}
              >
                <User className="h-4 w-4 mr-2" />
                View All Users
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        open={showNotifications} 
        onOpenChange={setShowNotifications}
        userId={user.id}
      />

      {/* User List Panel */}
      <UserList 
        open={showUserList} 
        onOpenChange={setShowUserList}
      />
    </div>
  )
}