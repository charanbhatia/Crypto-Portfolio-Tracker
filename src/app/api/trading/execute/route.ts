import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { fetchCryptoPrice } from "@/lib/coingecko"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { symbol, type, amount, price, total } = await request.json()

    if (!symbol || !type || !amount || !price || !total) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: {
        holdings: true
      }
    })

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    // Validate trade
    if (type === "BUY") {
      if (total > portfolio.usdBalance) {
        return NextResponse.json(
          { error: "Insufficient USD balance" },
          { status: 400 }
        )
      }
    } else if (type === "SELL") {
      const holding = portfolio.holdings.find(h => h.symbol === symbol)
      if (!holding || holding.amount < amount) {
        return NextResponse.json(
          { error: "Insufficient crypto balance" },
          { status: 400 }
        )
      }
    }

    // Execute trade in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create trade record
      const trade = await tx.trade.create({
        data: {
          userId: session.user.id,
          symbol,
          type,
          amount,
          price,
          total,
        }
      })

      if (type === "BUY") {
        // Update USD balance
        await tx.portfolio.update({
          where: { userId: session.user.id },
          data: {
            usdBalance: portfolio.usdBalance - total
          }
        })

        // Update or create holding
        const existingHolding = portfolio.holdings.find(h => h.symbol === symbol)
        
        if (existingHolding) {
          // Update existing holding with weighted average price
          const newTotalAmount = existingHolding.amount + amount
          const newTotalValue = (existingHolding.amount * existingHolding.avgBuyPrice) + total
          const newAvgPrice = newTotalValue / newTotalAmount

          await tx.holding.update({
            where: { id: existingHolding.id },
            data: {
              amount: newTotalAmount,
              avgBuyPrice: newAvgPrice,
            }
          })
        } else {
          // Create new holding
          await tx.holding.create({
            data: {
              portfolioId: portfolio.id,
              symbol,
              amount,
              avgBuyPrice: price,
            }
          })
        }
      } else if (type === "SELL") {
        // Update USD balance
        await tx.portfolio.update({
          where: { userId: session.user.id },
          data: {
            usdBalance: portfolio.usdBalance + total
          }
        })

        // Update holding
        const holding = portfolio.holdings.find(h => h.symbol === symbol)!
        
        if (holding.amount === amount) {
          // Remove holding if selling all
          await tx.holding.delete({
            where: { id: holding.id }
          })
        } else {
          // Update holding amount
          await tx.holding.update({
            where: { id: holding.id },
            data: {
              amount: holding.amount - amount
            }
          })
        }
      }

      return trade
    })

    return NextResponse.json({
      message: "Trade executed successfully",
      trade: result
    })
  } catch (error) {
    console.error("Error executing trade:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
