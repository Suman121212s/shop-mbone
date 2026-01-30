'use client'

import { Package, Clock, CircleCheck as CheckCircle, Circle as XCircle, Truck, ExternalLink, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Order, OrderItem, Shipment } from '@/lib/types/database'

interface OrderWithItems extends Order {
  order_items: OrderItem[]
  shipments: Shipment[]
}

interface OrderCardProps {
  order: OrderWithItems
}

export function OrderCard({ order }: OrderCardProps) {
  const shipment = order.shipments?.[0] // Get the first (and likely only) shipment

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'paid':
        return 'bg-blue-500'
      case 'shipped':
        return 'bg-green-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getShipmentStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500'
      case 'shipped':
        return 'bg-blue-500'
      case 'in_transit':
        return 'bg-purple-500'
      case 'delivered':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {order.invoice_id || `Order #${order.id.slice(-8)}`}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor(order.status)} text-white`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </Badge>
            {order.wallet_address && (
              <Badge className="bg-brand-accent text-white">
                <Wallet className="h-3 w-3 mr-1" />
                MBONE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
              </p>
              <p className="font-semibold text-brand-secondary">
                Total: ${order.total_usd.toFixed(2)}
              </p>
              {order.wallet_address && order.total_mbone > 0 && (
                <p className="text-xs text-brand-accent">
                  {order.total_mbone.toFixed(2)} MBONE
                </p>
              )}
            </div>
            <div className="text-right space-y-2">
              {shipment?.status === 'shipped' && shipment.tracking_number && (
                <Button variant="outline" size="sm">
                  Track Package
                </Button>
              )}
              {order.payment_tx_hash && (
                <div>
                  <a 
                    href={`https://polygonscan.com/tx/${order.payment_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
                  >
                    View Transaction <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Shipment Information */}
          {shipment && (
            <div className="bg-muted/30 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Shipment Status:</span>
                <Badge className={`${getShipmentStatusColor(shipment.status)} text-white text-xs`}>
                  {shipment.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              {shipment.courier_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Courier:</span>
                  <span>{shipment.courier_name}</span>
                </div>
              )}
              
              {shipment.tracking_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tracking:</span>
                  <span className="font-mono">{shipment.tracking_number}</span>
                </div>
              )}
              
              {shipment.shipped_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipped:</span>
                  <span>{new Date(shipment.shipped_at).toLocaleDateString()}</span>
                </div>
              )}
              
              {shipment.delivered_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivered:</span>
                  <span>{new Date(shipment.delivered_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {order.wallet_address && (
            <div className="bg-brand-accent/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Wallet Address:</p>
              <p className="text-xs font-mono text-brand-accent break-all">
                {order.wallet_address}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}