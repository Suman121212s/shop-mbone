'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Wallet } from 'lucide-react'
import { CryptoPayment } from './CryptoPayment'

export function CheckoutForm() {
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Shipping Information */}
      <div className="bg-card p-6 rounded-2xl border border-border/50">
        <h3 className="text-lg font-semibold text-brand-secondary mb-4">Shipping Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={shippingInfo.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={shippingInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={shippingInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="New York"
            />
          </div>
          
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={shippingInfo.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="NY"
            />
          </div>
          
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={shippingInfo.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="10001"
            />
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={shippingInfo.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="United States"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Method */}
      <div className="bg-card p-6 rounded-2xl border border-border/50">
        <h3 className="text-lg font-semibold text-brand-secondary mb-4">Payment Method</h3>
        
        <div className="space-y-4">
          {/* Traditional Payment (Placeholder) */}
          <div className="border border-border rounded-lg p-4 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Credit/Debit Card</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground">Traditional payment methods will be available soon.</p>
          </div>

          {/* Crypto Payment */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-5 w-5 text-brand-accent" />
              <span className="font-medium">Pay with MBONE Token</span>
            </div>
            <CryptoPayment />
          </div>
        </div>
      </div>
    </div>
  )
}