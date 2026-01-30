import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProductDetails } from '@/components/products/ProductDetails'
import { Product } from '@/lib/types/database'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createServerSupabaseClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    notFound()
  }

  const { data: productImages } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', params.id)
    .order('position')

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetails product={product as Product} images={productImages || []} />
    </div>
  )
}