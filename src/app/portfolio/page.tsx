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
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

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

interface Trade {
  id: string
  symbol: string
  type: string
  amount: number
  price: number
  total: number
  createdAt: string
}

export default function PortfolioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prices, setPrices] = useState<CryptoPriceMap>({})
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
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
      const [pricesResponse, portfolioResponse, tradesResponse] = await Promise.all([
        fetch("/api/crypto/prices"),
        fetch("/api/portfolio"),
        fetch("/api/trading/history?limit=50")
      ])

      const pricesData = await pricesResponse.json()
      const portfolioData = await portfolioResponse.json()
      const tradesData = await tradesResponse.json()

      setPrices(pricesData)
      setPortfolio(portfolioData)
      setTrades(tradesData)
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

  // Prepare data for charts
  const pieChartData = portfolio?.holdings.map(holding => ({
    name: holding.symbol,
    value: holding.value,
    color: getColorForSymbol(holding.symbol)
  })) || []

  const barChartData = portfolio?.holdings.map(holding => ({
    symbol: holding.symbol,
    value: holding.value,
    profitLoss: holding.profitLoss,
    profitLossPercentage: holding.profitLossPercentage
  })) || []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  function getColorForSymbol(symbol: string) {
    const colorMap: { [key: string]: string } = {
      'BTC': '#F7931A',
      'ETH': '#627EEA',
      'USDT': '#26A17B',
      'USDC': '#2775CA',
      'XMR': '#FF6600',
      'SOL': '#9945FF'
    }
    return colorMap[symbol] || '#8884D8'
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Detailed view of your cryptocurrency portfolio performance
          </p>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatPrice(portfolio?.totalValue || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invested</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatPrice(portfolio?.totalInvested || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {portfolio?.totalProfitLoss && portfolio.totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">P&L</p>
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

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {portfolio?.profitLossPercentage && portfolio.profitLossPercentage >= 0 ? (
                  <ArrowUpRight className="h-8 w-8 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">P&L %</p>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center mb-4">
              <PieChart className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Portfolio Distribution</h3>
            </div>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatPrice(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No holdings to display
              </div>
            )}
          </div>

          {/* Performance Bar Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Holdings Performance</h3>
            </div>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="symbol" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'value' ? formatPrice(Number(value)) : formatPercentage(Number(value)),
                    name === 'value' ? 'Value' : 'P&L %'
                  ]} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Value" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No holdings to display
              </div>
            )}
          </div>
        </div>

        {/* Detailed Holdings Table */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Detailed Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Buy Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P&L %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
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
                          {formatPrice(holding.profitLoss)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          holding.profitLossPercentage >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatPercentage(holding.profitLossPercentage)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No holdings yet. Start trading to build your portfolio!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trading Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Trading Activity</h3>
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
                  {trades.slice(0, 10).map((trade) => (
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
                  No trading activity yet. Start trading to see your history here!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
