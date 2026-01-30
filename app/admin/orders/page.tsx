'use client'

import { useEffect, useState } from 'react'
import { Package, Truck, CreditCard as Edit, Save, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/providers/AuthProvider'
import { Order, OrderItem, Shipment } from '@/lib/types/database'
import { toast } from 'sonner'

interface OrderWithDetails extends Order {
  order_items: OrderItem[]
  shipments: Shipment[]
}

interface EditingShipment {
  orderId: string
  courierName: string
  trackingNumber: string
  status: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [editingShipment, setEditingShipment] = useState<EditingShipment | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.orders || [])
      } else {
        toast.error(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleEditShipment = (order: OrderWithDetails) => {
    const shipment = order.shipments?.[0]
    setEditingShipment({
      orderId: order.id,
      courierName: shipment?.courier_name || '',
      trackingNumber: shipment?.tracking_number || '',
      status: shipment?.status || 'processing'
    })
  }

  const handleSaveShipment = async () => {
    if (!editingShipment) return

    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: editingShipment.orderId,
          courierName: editingShipment.courierName,
          trackingNumber: editingShipment.trackingNumber,
          status: editingShipment.status
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Shipment updated successfully')
        setEditingShipment(null)
        fetchOrders() // Refresh orders
      } else {
        toast.error(data.error || 'Failed to update shipment')
      }
    } catch (error) {
      console.error('Error updating shipment:', error)
      toast.error('Failed to update shipment')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-500'
      case 'shipped':
        return 'bg-green-500'
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-secondary mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need to be signed in to access admin features.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary mb-2">Admin - Order Management</h1>
        <p className="text-muted-foreground">Manage paid orders and shipments</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-secondary mb-2">No paid orders</h2>
          <p className="text-muted-foreground">Paid orders will appear here for shipment management</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shipment = order.shipments?.[0]
            const isEditing = editingShipment?.orderId === order.id

            return (
              <Card key={order.id} className="border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {order.invoice_id || `Order #${order.id.slice(-8)}`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.user_id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.toUpperCase()}
                      </Badge>
                      <Badge className="bg-brand-accent text-white">
                        ${order.total_usd.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-2">Items ({order.order_items.length})</h4>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items.length} items • Total: ${order.total_usd.toFixed(2)} • {order.total_mbone.toFixed(2)} MBONE
                      </div>
                    </div>

                    {/* Shipment Management */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Shipment Details
                        </h4>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditShipment(order)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Courier Name</label>
                              <Input
                                value={editingShipment.courierName}
                                onChange={(e) => setEditingShipment({
                                  ...editingShipment,
                                  courierName: e.target.value
                                })}
                                placeholder="e.g., FedEx, UPS, DHL"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Tracking Number</label>
                              <Input
                                value={editingShipment.trackingNumber}
                                onChange={(e) => setEditingShipment({
                                  ...editingShipment,
                                  trackingNumber: e.target.value
                                })}
                                placeholder="Enter tracking number"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select
                              value={editingShipment.status}
                              onValueChange={(value) => setEditingShipment({
                                ...editingShipment,
                                status: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="in_transit">In Transit</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveShipment} size="sm">
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingShipment(null)}
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Status:</span>
                            <Badge className={`${getShipmentStatusColor(shipment?.status || 'processing')} text-white text-xs`}>
                              {(shipment?.status || 'processing').replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          {shipment?.courier_name && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Courier:</span>
                              <span>{shipment.courier_name}</span>
                            </div>
                          )}
                          {shipment?.tracking_number && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Tracking:</span>
                              <span className="font-mono">{shipment.tracking_number}</span>
                            </div>
                          )}
                          {shipment?.shipped_at && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Shipped:</span>
                              <span>{new Date(shipment.shipped_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}