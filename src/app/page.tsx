"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CryptoPriceMap } from "@/lib/coingecko"
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Shield, 
  Zap, 
  BarChart3,
  Star,
  Users,
  Globe,
  Github,
  Twitter,
  Linkedin
} from "lucide-react"
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
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:bg-gradient-to-br light:from-blue-50 light:via-purple-50 light:to-blue-50">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Crypto<span className="text-gradient">Tracker</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <Link
                href="/auth/signin"
                className="hidden sm:inline-flex px-4 sm:px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <div className="animate-float mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Master Your
              <span className="block text-gradient">Crypto Portfolio</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Professional-grade portfolio tracking with real-time prices, 
              advanced analytics, and mock trading capabilities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link
                href="/auth/signup"
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 text-center"
              >
                Start Trading Free
                <ArrowRight className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-center"
              >
                Sign In
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-4xl mx-auto px-4">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">$10K</div>
                <div className="text-gray-600 dark:text-gray-400">Starting Balance</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">6</div>
                <div className="text-gray-600 dark:text-gray-400">Cryptocurrencies</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-400">Real-time Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Prices Section */}
      <section className="py-12 sm:py-20 relative bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Live Market Data
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real-time cryptocurrency prices updated every 30 seconds from CoinGecko API
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {Object.entries(prices).map(([symbol, coin]) => (
              <div
                key={symbol}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 card-hover border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {coin.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">
                        {symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(coin.current_price)}
                    </p>
                    <div
                      className={`flex items-center text-xs sm:text-sm font-medium ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      )}
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Market Cap:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(coin.market_cap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(coin.total_volume)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 relative bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Powerful Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to master cryptocurrency portfolio management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 card-hover border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Real-time Prices
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                Live cryptocurrency prices updated every 30 seconds from CoinGecko API with advanced market data
              </p>
            </div>

            <div className="group text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 card-hover border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Mock Trading
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                Practice trading with $10,000 starting balance. Buy and sell cryptocurrencies safely with real market conditions
              </p>
            </div>

            <div className="group text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 card-hover border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Portfolio Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                Advanced portfolio tracking with profit/loss analysis, performance charts, and detailed trading history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 dark:bg-gradient-to-r dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 border-t border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Crypto<span className="text-gradient">Tracker</span>
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                Professional cryptocurrency portfolio tracking with real-time data, 
                advanced analytics, and mock trading capabilities.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 dark:bg-white/10 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                  <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-white" />
                </a>
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 dark:bg-white/10 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-white" />
                </a>
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 dark:bg-white/10 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><a href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base">Dashboard</a></li>
                <li><a href="/trading" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base">Trading</a></li>
                <li><a href="/portfolio" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base">Portfolio</a></li>
                <li><a href="/auth/signin" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base">Sign In</a></li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Features</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Real-time Prices</span></li>
                <li><span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Mock Trading</span></li>
                <li><span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Portfolio Analytics</span></li>
                <li><span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Dark Mode</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm text-center">
                &copy; 2025 Crypto Portfolio Tracker. Built with Next.js, TypeScript, and Tailwind CSS.
              </p>
              <div className="flex items-center space-x-4 sm:space-x-6">
                <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Supported by</span>
                <div className="flex items-center space-x-2">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">CoinGecko API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
