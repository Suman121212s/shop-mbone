'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCartStore } from '@/lib/stores/cartStore'
import { supabase } from '@/lib/supabase/client'
import { Product } from '@/lib/types/database'
import { ProductCard } from '@/components/products/ProductCard'
import { toast } from 'sonner'

interface LikedItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product: Product
}

export default function LikedItemsPage() {
  const [likedItems, setLikedItems] = useState<LikedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchLikedItems()
    }
  }, [user])

  const fetchLikedItems = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('liked_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLikedItems(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch liked items')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-secondary mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to view your liked items.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary mb-2">Liked Items</h1>
        <p className="text-muted-foreground">Your favorite products</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading liked items...</p>
        </div>
      ) : likedItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-secondary mb-2">No liked items yet</h2>
          <p className="text-muted-foreground mb-6">Start browsing and like products to see them here</p>
          <Button 
            onClick={() => window.location.href = '/products'}
            className="bg-brand-accent hover:bg-brand-accent/90"
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {likedItems.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  )
}