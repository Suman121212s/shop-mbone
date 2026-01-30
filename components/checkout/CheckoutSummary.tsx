'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/stores/cartStore'
import Image from 'next/image'

export function CheckoutSummary() {
  const { items, getTotalPrice, getTotalItems } = useCartStore()
  
  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg text-brand-secondary">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.product.image_url || '/placeholder-product.jpg'}
                  alt={item.product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="text-sm font-medium">
                    ${(item.product.final_mrp * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Separator />
        
        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({getTotalItems()} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shipping === 0 ? (
                <Badge variant="secondary" className="text-xs">Free</Badge>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          
          {subtotal < 50 && (
            <div className="bg-brand-accent/10 p-3 rounded-lg mt-3">
              <p className="text-xs text-brand-accent text-center">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
              </p>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-brand-secondary">Total</span>
          <span className="text-brand-secondary">${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}