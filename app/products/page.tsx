'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductGrid } from '@/components/products/ProductGrid'
import { supabase } from '@/lib/supabase/client'
import { Product } from '@/lib/types/database'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [priceRange, setPriceRange] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, sortBy, priceRange])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    // Search filter
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      query = query.gte('final_mrp', min)
      if (max) {
        query = query.lte('final_mrp', max)
      }
    }

    // Sorting
    if (sortBy === 'price-low') {
      query = query.order('final_mrp', { ascending: true })
    } else if (sortBy === 'price-high') {
      query = query.order('final_mrp', { ascending: false })
    } else {
      query = query.order(sortBy, { ascending: true })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary mb-4">All Products</h1>
        <p className="text-muted-foreground">Discover our complete collection of electronics and gadgets</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-card p-6 rounded-2xl mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="created_at">Newest First</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-50">Under $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200-">Over $200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}