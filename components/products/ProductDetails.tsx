'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, ShoppingCart, Star, Tag, Truck, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product, ProductImage } from '@/lib/types/database'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from 'sonner'

interface ProductDetailsProps {
  product: Product
  images: ProductImage[]
}

export function ProductDetails({ product, images }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart`)
  }

  const allImages = [
    product.image_url,
    ...images.map(img => img.image_url)
  ].filter(Boolean)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
          <Image
            src={allImages[selectedImage] || '/placeholder-product.jpg'}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnail Images */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {allImages.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-brand-accent' : 'border-transparent'
                }`}
              >
                <Image
                  src={image || '/placeholder-product.jpg'}
                  alt={`${product.name} ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-6">
        {/* Product Title and Badges */}
        <div className="space-y-2">
          <div className="flex gap-2 mb-2">
            {product.is_featured && (
              <Badge className="bg-brand-accent text-white">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {product.discount > 0 && (
              <Badge className="bg-brand-highlight text-white">
                -{product.discount}% OFF
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-brand-secondary">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.description}</p>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-secondary">
              ${product.final_mrp.toFixed(2)}
            </span>
            {product.mrp > product.final_mrp && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.mrp.toFixed(2)}
              </span>
            )}
          </div>
          {product.you_save > 0 && (
            <p className="text-green-600 font-medium">
              You save: ${product.you_save.toFixed(2)}
            </p>
          )}
        </div>

        {/* Exclusive Reward */}
        {product.exclusive_reward && (
          <div className="bg-brand-accent/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-brand-accent">
              <Tag className="h-4 w-4" />
              <span className="font-medium">{product.exclusive_reward}</span>
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart - ${(product.final_mrp * quantity).toFixed(2)}
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">Free Shipping</p>
              <p className="text-xs text-muted-foreground">On orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">Warranty</p>
              <p className="text-xs text-muted-foreground">1 year manufacturer warranty</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}