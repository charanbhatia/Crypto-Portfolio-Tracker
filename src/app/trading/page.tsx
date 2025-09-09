"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { CryptoPriceMap } from "@/lib/coingecko"
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet
} from "lucide-react"

interface TradeForm {
  symbol: string
  type: "BUY" | "SELL"
  amount: number
  price: number
  total: number
}

interface PortfolioData {
  usdBalance: number
  holdings: Array<{
    symbol: string
    amount: number
    avgBuyPrice: number
  }>
}

interface Trade {
  id: string
  symbol: string
  type: string
  amount: number
  price: number
  total: number
  createdAt: string
}

export default function TradingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prices, setPrices] = useState<CryptoPriceMap>({})
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [trading, setTrading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const [tradeForm, setTradeForm] = useState<TradeForm>({
    symbol: "BTC",
    type: "BUY",
    amount: NaN,
    price: 0,
    total: 0
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [pricesResponse, portfolioResponse, tradesResponse] = await Promise.all([
        fetch("/api/crypto/prices"),
        fetch("/api/portfolio"),
        fetch("/api/trading/history?limit=10")
      ])

      const pricesData = await pricesResponse.json()
      const portfolioData = await portfolioResponse.json()
      const tradesData = await tradesResponse.json()

      setPrices(pricesData)
      setPortfolio({
        usdBalance: portfolioData.totalValue - portfolioData.holdings.reduce((sum: number, h: any) => sum + h.value, 0),
        holdings: portfolioData.holdings.map((h: any) => ({
          symbol: h.symbol,
          amount: h.amount,
          avgBuyPrice: h.avgBuyPrice
        }))
      })
      setTrades(tradesData)

      // Update current price in form
      if (pricesData[tradeForm.symbol]) {
        setTradeForm(prev => ({
          ...prev,
          price: pricesData[tradeForm.symbol].current_price
        }))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSymbolChange = (symbol: string) => {
    const newPrice = prices[symbol]?.current_price || 0
    setTradeForm(prev => ({
      ...prev,
      symbol,
      price: newPrice,
      total: prev.amount * newPrice
    }))
  }

  const handleAmountChange = (amount: number) => {
    setTradeForm(prev => ({
      ...prev,
      amount,
      total: amount * prev.price
    }))
  }

  const handleTrade = async () => {
    if (tradeForm.amount <= 0) {
      setMessage("Please enter a valid amount")
      setMessageType("error")
      return
    }

    if (tradeForm.type === "BUY" && tradeForm.total > (portfolio?.usdBalance || 0)) {
      setMessage("Insufficient USD balance")
      setMessageType("error")
      return
    }

    if (tradeForm.type === "SELL") {
      const holding = portfolio?.holdings.find(h => h.symbol === tradeForm.symbol)
      if (!holding || holding.amount < tradeForm.amount) {
        setMessage("Insufficient crypto balance")
        setMessageType("error")
        return
      }
    }

    setTrading(true)
    setMessage("")

    try {
      const response = await fetch("/api/trading/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeForm),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Trade executed successfully! ${tradeForm.type} ${tradeForm.amount} ${tradeForm.symbol}`)
        setMessageType("success")
        setTradeForm(prev => ({ ...prev, amount: 0, total: 0 }))
        fetchData() // Refresh data
      } else {
        setMessage(data.error || "Trade failed")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
      setMessageType("error")
    } finally {
      setTrading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getAvailableBalance = () => {
    if (tradeForm.type === "BUY") {
      return portfolio?.usdBalance || 0
    } else {
      const holding = portfolio?.holdings.find(h => h.symbol === tradeForm.symbol)
      return holding?.amount || 0
    }
  }

  const getMaxAmount = () => {
    if (tradeForm.type === "BUY") {
      const usdBalance = portfolio?.usdBalance || 0
      const price = tradeForm.price || 1
      return price > 0 ? Math.floor((usdBalance / price) * 1000000) / 1000000 : 0
    } else {
      const holding = portfolio?.holdings.find(h => h.symbol === tradeForm.symbol)
      return holding?.amount || 0
    }
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading</h1>
          <p className="text-gray-600">
            Buy and sell cryptocurrencies with real-time prices
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">USD Balance</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPrice(portfolio?.usdBalance || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available {tradeForm.symbol}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getAvailableBalance().toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Place Trade</h3>
          </div>
          <div className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                messageType === "success" 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trade Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTradeForm(prev => ({ ...prev, type: "BUY" }))}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                      tradeForm.type === "BUY"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 inline mr-2" />
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeForm(prev => ({ ...prev, type: "SELL" }))}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                      tradeForm.type === "SELL"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 inline mr-2" />
                    Sell
                  </button>
                </div>
              </div>

              {/* Cryptocurrency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cryptocurrency
                </label>
                <select
                  value={tradeForm.symbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.entries(prices).map(([symbol, coin]) => (
                    <option key={symbol} value={symbol}>
                      {symbol} - {coin.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({tradeForm.symbol})
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={Number.isNaN(tradeForm.amount) ? "" : String(tradeForm.amount)}
                    onChange={(e) => {
                      const raw = e.target.value.trim()
                      if (raw === "") {
                        setTradeForm((prev) => ({ ...prev, amount: NaN, total: 0 }))
                        return
                      }
                      const numeric = Number(raw)
                      if (!Number.isNaN(numeric) && numeric >= 0) {
                        handleAmountChange(numeric)
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.000000"
                  />
                  <button
                    onClick={() => handleAmountChange(getMaxAmount())}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Max
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max: {getMaxAmount().toFixed(6)} {tradeForm.symbol}
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {formatPrice(tradeForm.price)}
                    </span>
                    <div className={`flex items-center text-sm ${
                      prices[tradeForm.symbol]?.price_change_percentage_24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {prices[tradeForm.symbol]?.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {prices[tradeForm.symbol]?.price_change_percentage_24h?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(tradeForm.total)}
                </span>
              </div>
            </div>

            {/* Execute Trade Button */}
            <div className="mt-6">
              <button
                onClick={handleTrade}
                disabled={trading || tradeForm.amount <= 0}
                className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                  tradeForm.type === "BUY"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {trading ? "Executing..." : `${tradeForm.type} ${tradeForm.symbol}`}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Trades</h3>
          </div>
          <div className="overflow-x-auto">
            {trades.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          trade.type === "BUY"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.amount.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(trade.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(trade.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trade.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6">
                <p className="text-gray-500 text-center py-8">
                  No trades yet. Start trading to see your history here!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
