export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

export interface CryptoPriceMap {
  [key: string]: CryptoPrice
}

const COINGECKO_API_URL = process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3"

export async function fetchCryptoPrices(): Promise<CryptoPriceMap> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,usd-coin,monero,solana&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
      {
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: CryptoPrice[] = await response.json()
    
    // Convert array to map for easier access
    const priceMap: CryptoPriceMap = {}
    data.forEach((coin) => {
      priceMap[coin.symbol.toUpperCase()] = coin
    })

    return priceMap
  } catch (error) {
    console.error("Error fetching crypto prices:", error)
    throw error
  }
}

export async function fetchCryptoPrice(symbol: string): Promise<CryptoPrice | null> {
  try {
    const prices = await fetchCryptoPrices()
    return prices[symbol.toUpperCase()] || null
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

// Mock data for development/fallback
export const mockCryptoPrices: CryptoPriceMap = {
  BTC: {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 45000,
    price_change_percentage_24h: 2.5,
    market_cap: 850000000000,
    total_volume: 25000000000,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
  },
  ETH: {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    current_price: 3000,
    price_change_percentage_24h: -1.2,
    market_cap: 360000000000,
    total_volume: 15000000000,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
  },
  USDT: {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    current_price: 1.00,
    price_change_percentage_24h: 0.01,
    market_cap: 120000000000,
    total_volume: 50000000000,
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png"
  },
  USDC: {
    id: "usd-coin",
    symbol: "usdc",
    name: "USD Coin",
    current_price: 1.00,
    price_change_percentage_24h: 0.01,
    market_cap: 80000000000,
    total_volume: 30000000000,
    image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png"
  },
  XMR: {
    id: "monero",
    symbol: "xmr",
    name: "Monero",
    current_price: 150,
    price_change_percentage_24h: 3.2,
    market_cap: 2700000000,
    total_volume: 50000000,
    image: "https://assets.coingecko.com/coins/images/69/large/monero_logo.png"
  },
  SOL: {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    current_price: 100,
    price_change_percentage_24h: 5.8,
    market_cap: 45000000000,
    total_volume: 2000000000,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png"
  }
}
