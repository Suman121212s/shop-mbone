'use client'

import { useState } from 'react'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary'
import { useCartStore } from '@/lib/stores/cartStore'
import { useAuth } from '@/components/providers/AuthProvider'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { items } = useCartStore()
  const { user } = useAuth()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-secondary mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to checkout</p>
          <Link href="/products">
            <Button className="bg-brand-accent hover:bg-brand-accent/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-md mx-auto">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-secondary mb-2">Sign in required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to continue with checkout</p>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-brand-accent hover:bg-brand-accent/90"
          >
            Sign In
          </Button>
          <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <CheckoutForm />
        </div>
        <div>
          <CheckoutSummary />
        </div>
      </div>
    </div>
  )
}