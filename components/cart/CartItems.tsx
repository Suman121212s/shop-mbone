'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cartStore'

export function CartItems() {
  const { items, updateQuantity, removeItem } = useCartStore()

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.product.id} className="bg-card p-6 rounded-2xl border border-border/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Product Image */}
            <div className="w-full sm:w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.product.image_url || '/placeholder-product.jpg'}
                alt={item.product.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-brand-secondary">{item.product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.product.description}</p>
              
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-secondary">
                  ${item.product.final_mrp.toFixed(2)}
                </span>
                {item.product.mrp > item.product.final_mrp && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${item.product.mrp.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-center min-w-[60px]">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.product.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Item Total */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="font-semibold text-brand-secondary">
                ${(item.product.final_mrp * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}