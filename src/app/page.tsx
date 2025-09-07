"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CryptoPriceMap } from "@/lib/coingecko"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prices, setPrices] = useState<CryptoPriceMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      router.push("/dashboard")
      return
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [session, status, router])

  const fetchPrices = async () => {
    try {
      const response = await fetch("/api/crypto/prices")
      const data = await response.json()
      setPrices(data)
    } catch (error) {
      console.error("Error fetching prices:", error)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Crypto Portfolio Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/auth/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 px-4 py-2 rounded-md hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Track Your Crypto Portfolio
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Real-time prices, mock trading, and portfolio management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/signin"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Prices Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Live Crypto Prices
            </h3>
            <p className="text-gray-600">
              Real-time prices updated every 30 seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(prices).map(([symbol, coin]) => (
              <div
                key={symbol}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {coin.name}
                      </h4>
                      <p className="text-sm text-gray-500 uppercase">
                        {symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(coin.current_price)}
                    </p>
                    <div
                      className={`flex items-center text-sm ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Market Cap: {formatPrice(coin.market_cap)}</p>
                  <p>Volume: {formatPrice(coin.total_volume)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Features
            </h3>
            <p className="text-gray-600">
              Everything you need to track and manage your crypto portfolio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Prices
              </h4>
              <p className="text-gray-600">
                Live cryptocurrency prices updated every 30 seconds from CoinGecko API
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Mock Trading
              </h4>
              <p className="text-gray-600">
                Practice trading with $10,000 starting balance. Buy and sell cryptocurrencies safely
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Portfolio Tracking
              </h4>
              <p className="text-gray-600">
                Monitor your holdings, track profit/loss, and view your trading history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Crypto Portfolio Tracker. Built with Next.js and TypeScript.</p>
        </div>
      </footer>
    </div>
  )
}
