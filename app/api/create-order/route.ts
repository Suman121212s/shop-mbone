import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
// import { ethers } from 'ethers'
// import { PAYMENT_PROCESSOR_ADDRESS, PROCESSOR_ABI, usdToMBONE } from '@/lib/web3/config'

export async function POST(request: NextRequest) {
  try {
    const { cartItems, walletAddress } = await request.json()
    
    if (!cartItems || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate totals
    let totalUSD = 0
    const orderItems = []

    for (const item of cartItems) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product.id)
        .single()

      if (!product) {
        return NextResponse.json({ error: `Product ${item.product.id} not found` }, { status: 404 })
      }

      const itemTotal = product.final_mrp * item.quantity
      totalUSD += itemTotal

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price_usd: product.final_mrp,
        price_mbone: product.final_mrp // 1:1 ratio for now
      })
    }

    const totalMBONE = BigInt(Math.floor(totalUSD * 1e18)) // Simple 1:1 conversion for now

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        total_usd: totalUSD,
        total_mbone: Number(totalMBONE) / 1e18,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Generate order hash
    const orderHash = `0x${Buffer.from(order.id).toString('hex').padStart(64, '0')}`

    // Update order with hash
    await supabase
      .from('orders')
      .update({ order_hash: orderHash })
      .eq('id', order.id)

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    // Create order on blockchain (using admin wallet)
    // Blockchain integration will be added when contracts are deployed
    console.log('Order created:', { orderHash, totalMBONE: totalMBONE.toString() })

    return NextResponse.json({
      orderId: order.id,
      orderHash,
      totalUSD,
      totalMBONE: totalMBONE.toString(),
      success: true
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}