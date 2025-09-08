import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { fetchCryptoPrices } from "@/lib/coingecko"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        holdings: true
      }
    })

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    // Get current crypto prices
    const prices = await fetchCryptoPrices()

    // Calculate portfolio value and P&L
    let totalValue = portfolio.usdBalance
    let totalInvested = portfolio.usdBalance
    let totalProfitLoss = 0

    const holdingsWithValues = portfolio.holdings.map((holding) => {
      const currentPrice = prices[holding.symbol]?.current_price || 0
      const value = holding.amount * currentPrice
      const invested = holding.amount * holding.avgBuyPrice
      const profitLoss = value - invested
      const profitLossPercentage = invested > 0 ? (profitLoss / invested) * 100 : 0

      totalValue += value
      totalInvested += invested
      totalProfitLoss += profitLoss

      return {
        symbol: holding.symbol,
        amount: holding.amount,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice,
        value,
        profitLoss,
        profitLossPercentage
      }
    })

    const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0

    return NextResponse.json({
      totalValue,
      totalInvested,
      totalProfitLoss,
      profitLossPercentage,
      holdings: holdingsWithValues
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
