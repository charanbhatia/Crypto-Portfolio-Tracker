"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { CryptoPriceMap } from "@/lib/coingecko"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

interface PortfolioData {
  totalValue: number
  totalInvested: number
  totalProfitLoss: number
  profitLossPercentage: number
  holdings: Array<{
    symbol: string
    amount: number
    avgBuyPrice: number
    currentPrice: number
    value: number
    profitLoss: number
    profitLossPercentage: number
  }>
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prices, setPrices] = useState<CryptoPriceMap>({})
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

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
      const [pricesResponse, portfolioResponse] = await Promise.all([
        fetch("/api/crypto/prices"),
        fetch("/api/portfolio")
      ])

      const pricesData = await pricesResponse.json()
      const portfolioData = await portfolioResponse.json()

      setPrices(pricesData)
      setPortfolio(portfolioData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
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
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's your portfolio overview
          </p>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPrice(portfolio?.totalValue || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Invested</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPrice(portfolio?.totalInvested || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {portfolio?.totalProfitLoss && portfolio.totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">P&L</p>
                <p className={`text-2xl font-semibold ${
                  portfolio?.totalProfitLoss && portfolio.totalProfitLoss >= 0 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {formatPrice(portfolio?.totalProfitLoss || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {portfolio?.profitLossPercentage && portfolio.profitLossPercentage >= 0 ? (
                  <ArrowUpRight className="h-8 w-8 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">P&L %</p>
                <p className={`text-2xl font-semibold ${
                  portfolio?.profitLossPercentage && portfolio.profitLossPercentage >= 0 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {formatPercentage(portfolio?.profitLossPercentage || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Buy Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                  portfolio.holdings.map((holding) => (
                    <tr key={holding.symbol}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={prices[holding.symbol]?.image}
                            alt={holding.symbol}
                            className="h-8 w-8 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {holding.symbol}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prices[holding.symbol]?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {holding.amount.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(holding.avgBuyPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(holding.currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(holding.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          holding.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          <div>{formatPrice(holding.profitLoss)}</div>
                          <div>({formatPercentage(holding.profitLossPercentage)})</div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No holdings yet. Start trading to build your portfolio!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/trading"
                className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Start Trading
              </a>
              <a
                href="/portfolio"
                className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                View Portfolio
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Market Overview</h3>
            <div className="space-y-2">
              {Object.entries(prices).slice(0, 3).map(([symbol, coin]) => (
                <div key={symbol} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm font-medium">{symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatPrice(coin.current_price)}</div>
                    <div className={`text-xs ${
                      coin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
