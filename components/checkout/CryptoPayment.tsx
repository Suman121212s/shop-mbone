'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Wallet, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Loader as Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/stores/cartStore'
import { useAuth } from '@/components/providers/AuthProvider'
import { MBONE_TOKEN_ADDRESS, PAYMENT_PROCESSOR_ADDRESS, ERC20_ABI, PROCESSOR_ABI, usdToMBONE, generateInvoiceId } from '@/lib/web3/config'

interface OrderData {
  orderId: string
  orderHash: string
  invoiceId: string
  totalUSD: number
  totalMBONE: string
  mbonePriceUsd: number
}

export function CryptoPayment() {
  const [step, setStep] = useState<'connect' | 'approve' | 'pay' | 'confirming' | 'success' | 'error'>('connect')
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [mbonePrice, setMbonePrice] = useState<number>(0.25)
  const [approvalTxHash, setApprovalTxHash] = useState<string>('')
  const [paymentTxHash, setPaymentTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const { items, clearCart, getTotalPrice } = useCartStore()
  const { user } = useAuth()

  const totalUSD = getTotalPrice()
  const totalMBONE = usdToMBONE(totalUSD, mbonePrice)

  // Fetch MBONE price on component mount
  useEffect(() => {
    fetchMbonePrice()
  }, [])

  const fetchMbonePrice = async () => {
    try {
      const response = await fetch('/api/settings/mbone-price')
      const data = await response.json()
      if (response.ok) {
        setMbonePrice(data.price)
      }
    } catch (error) {
      console.error('Failed to fetch MBONE price:', error)
    }
  }

  // Check if on correct network
  const isCorrectNetwork = chainId === polygon.id

  // Handle transaction success
  useEffect(() => {
    if (isTxSuccess && txHash) {
      if (step === 'approve') {
        setApprovalTxHash(txHash)
        setStep('pay')
        toast.success('MBONE spending approved!')
      } else if (step === 'pay') {
        setPaymentTxHash(txHash)
        setStep('confirming')
        verifyPayment(txHash)
      }
    }
  }, [isTxSuccess, txHash, step])

  const createOrder = async () => {
    if (!address || !user) return

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items,
          walletAddress: address
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      setOrderData(data)
      setStep('approve')
    } catch (error: any) {
      setError(error.message)
      setStep('error')
      toast.error(error.message)
    }
  }

  const approveToken = async () => {
    if (!orderData) return

    try {
      writeContract({
        address: MBONE_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PAYMENT_PROCESSOR_ADDRESS as `0x${string}`, BigInt(orderData.totalMBONE)]
      })
    } catch (error: any) {
      setError(error.message)
      setStep('error')
      toast.error('Failed to approve MBONE spending')
    }
  }

  const payOrder = async () => {
    if (!orderData) return

    try {
      writeContract({
        address: PAYMENT_PROCESSOR_ADDRESS as `0x${string}`,
        abi: PROCESSOR_ABI,
        functionName: 'payOrder',
        args: [orderData.orderHash as `0x${string}`, orderData.invoiceId]
      })
    } catch (error: any) {
      setError(error.message)
      setStep('error')
      toast.error('Failed to process payment')
    }
  }

  const verifyPayment = async (txHash: string) => {
    if (!orderData) return

    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          txHash,
          invoiceId: orderData.invoiceId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed')
      }

      setStep('success')
      clearCart()
      toast.success('Payment successful! Order confirmed.')
    } catch (error: any) {
      setError(error.message)
      setStep('error')
      toast.error(error.message)
    }
  }

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(c => c.name === 'MetaMask')
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
    }
  }

  const handleNetworkSwitch = () => {
    switchChain({ chainId: polygon.id })
  }

  const getStepStatus = (stepName: string) => {
    const steps = ['connect', 'approve', 'pay', 'confirming']
    const currentIndex = steps.indexOf(step)
    const stepIndex = steps.indexOf(stepName)
    
    if (step === 'success') return 'completed'
    if (step === 'error') return stepIndex <= currentIndex ? 'error' : 'pending'
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  return (
    <Card className="border-brand-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-brand-accent" />
          Pay with MBONE Token
          <Badge className="bg-brand-accent text-white">Polygon Network</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Total Amount:</span>
            <span className="font-semibold">${totalUSD.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">MBONE Price:</span>
            <span className="font-semibold">${mbonePrice.toFixed(4)} USD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">MBONE Amount:</span>
            <span className="font-semibold text-brand-accent">
              {(Number(totalMBONE) / 1e18).toFixed(2)} MBONE
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          {[
            { key: 'connect', label: 'Connect Wallet', icon: Wallet },
            { key: 'approve', label: 'Approve MBONE', icon: CheckCircle2 },
            { key: 'pay', label: 'Pay Order', icon: CheckCircle2 },
            { key: 'confirming', label: 'Confirming', icon: Loader2 }
          ].map(({ key, label, icon: Icon }) => {
            const status = getStepStatus(key)
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'completed' ? 'bg-green-500 text-white' :
                  status === 'active' ? 'bg-brand-accent text-white' :
                  status === 'error' ? 'bg-red-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className={`h-4 w-4 ${status === 'active' && key === 'confirming' ? 'animate-spin' : ''}`} />
                </div>
                <span className={`text-sm ${
                  status === 'completed' ? 'text-green-600' :
                  status === 'active' ? 'text-brand-accent' :
                  status === 'error' ? 'text-red-500' :
                  'text-muted-foreground'
                }`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isConnected && step === 'connect' && (
            <Button onClick={handleConnect} className="w-full bg-brand-accent hover:bg-brand-accent/90">
              <Wallet className="h-4 w-4 mr-2" />
              Connect MetaMask
            </Button>
          )}

          {isConnected && !isCorrectNetwork && (
            <Button onClick={handleNetworkSwitch} className="w-full bg-orange-500 hover:bg-orange-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              Switch to Polygon Network
            </Button>
          )}

          {isConnected && isCorrectNetwork && step === 'connect' && (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Wallet Connected</span>
                </div>
                <p className="text-xs text-green-600 mt-1 font-mono">{address}</p>
              </div>
              <Button onClick={createOrder} className="w-full bg-brand-accent hover:bg-brand-accent/90">
                Create Order
              </Button>
            </div>
          )}

          {step === 'approve' && (
            <Button 
              onClick={approveToken} 
              disabled={isWritePending || isTxLoading}
              className="w-full bg-brand-accent hover:bg-brand-accent/90"
            >
              {isWritePending || isTxLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving MBONE...
                </>
              ) : (
                'Approve MBONE Spending'
              )}
            </Button>
          )}

          {step === 'pay' && (
            <Button 
              onClick={payOrder} 
              disabled={isWritePending || isTxLoading}
              className="w-full bg-brand-accent hover:bg-brand-accent/90"
            >
              {isWritePending || isTxLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Pay with MBONE'
              )}
            </Button>
          )}

          {step === 'confirming' && (
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-accent" />
              <p className="text-sm text-muted-foreground">Confirming payment on blockchain...</p>
              {orderData && (
                <p className="text-xs text-brand-accent">Invoice: {orderData.invoiceId}</p>
              )}
              {paymentTxHash && (
                <a 
                  href={`https://polygonscan.com/tx/${paymentTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
                >
                  View on PolygonScan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-green-700">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">Your order has been confirmed</p>
                {orderData && (
                  <p className="text-xs text-brand-accent mt-1">Invoice: {orderData.invoiceId}</p>
                )}
              </div>
              {paymentTxHash && (
                <a 
                  href={`https://polygonscan.com/tx/${paymentTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
                >
                  View Transaction <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-red-700">Payment Failed</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button 
                onClick={() => setStep('connect')} 
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          {isConnected && (
            <Button 
              onClick={() => disconnect()} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}