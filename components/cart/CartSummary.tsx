'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/stores/cartStore'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export function CartSummary() {
  const { items, getTotalPrice, getTotalItems } = useCartStore()
  
  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/50 space-y-4">
      <h3 className="text-lg font-semibold text-brand-secondary">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Subtotal ({getTotalItems()} items)</span>
          <span className="text-sm">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Shipping</span>
          <span className="text-sm">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Tax</span>
          <span className="text-sm">${tax.toFixed(2)}</span>
        </div>
        
        {subtotal < 50 && (
          <div className="bg-brand-accent/10 p-3 rounded-lg">
            <p className="text-xs text-brand-accent text-center">
              Add ${(50 - subtotal).toFixed(2)} more for free shipping!
            </p>
          </div>
        )}
      </div>
      
      <Separator />
      
      <div className="flex justify-between">
        <span className="font-semibold text-brand-secondary">Total</span>
        <span className="font-bold text-lg text-brand-secondary">${total.toFixed(2)}</span>
      </div>
      
      <div className="space-y-3 pt-4">
        <Link href="/checkout" className="block">
          <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white" size="lg">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Proceed to Checkout
          </Button>
        </Link>
        
        <Link href="/products" className="block">
          <Button variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}