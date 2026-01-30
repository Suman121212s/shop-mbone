import { http, createConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

// Smart Contract Addresses (Replace with actual deployed addresses)
export const MBONE_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890" as `0x${string}` // Replace with actual MBONE token address
export const PAYMENT_PROCESSOR_ADDRESS = "0x0987654321098765432109876543210987654321" as `0x${string}` // Replace with actual payment processor address

// Contract ABIs
export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
] as const

export const PROCESSOR_ABI = [
  "function payOrder(bytes32 orderId, string invoiceId) external",
  "function createOrder(bytes32 orderId, uint256 amount, address buyer) external",
  "event OrderPaid(bytes32 indexed orderId, address indexed buyer, uint256 amount, string invoiceId)",
  "event OrderCreated(bytes32 indexed orderId, uint256 amount, address buyer)"
] as const

// Wagmi Configuration
export const config = createConfig({
  chains: [polygon],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    }),
  ],
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com'),
  },
})

// Convert USD to MBONE amount (with 18 decimals) using dynamic price
export const usdToMBONE = (usdAmount: number, mbonePriceUsd: number): bigint => {
  const mboneAmount = usdAmount / mbonePriceUsd
  return BigInt(Math.floor(mboneAmount * 1e18))
}

// Convert MBONE to USD
export const mboneToUSD = (mboneAmount: bigint, mbonePriceUsd: number): number => {
  return (Number(mboneAmount) / 1e18) * mbonePriceUsd
}

// Generate invoice ID from order ID
export const generateInvoiceId = (orderId: string): string => {
  return `ORD-${orderId.slice(0, 8)}`
}