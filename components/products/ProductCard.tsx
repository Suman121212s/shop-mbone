'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Star, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types/database'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-card rounded-2xl p-4 border border-border/50 hover-lift cursor-pointer">
        {/* Product Image */}
        <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-muted">
          <Image
            src={product.image_url || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-brand-highlight text-white">
              -{product.discount}%
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="absolute top-2 right-2 bg-brand-accent text-white">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-card-foreground line-clamp-2 group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-brand-secondary">
                ${product.final_mrp.toFixed(2)}
              </span>
              {product.mrp > product.final_mrp && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.mrp.toFixed(2)}
                </span>
              )}
            </div>
            {product.you_save > 0 && (
              <p className="text-xs text-green-600 font-medium">
                You save: ${product.you_save.toFixed(2)}
              </p>
            )}
          </div>

          {/* Exclusive Reward */}
          {product.exclusive_reward && (
            <div className="flex items-center gap-1 text-xs text-brand-accent">
              <Tag className="h-3 w-3" />
              {product.exclusive_reward}
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  )
}