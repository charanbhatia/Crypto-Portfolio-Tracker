import { NextResponse } from "next/server"
import { fetchCryptoPrices, mockCryptoPrices } from "@/lib/coingecko"

export async function GET() {
  try {
    const prices = await fetchCryptoPrices()
    return NextResponse.json(prices)
  } catch (error) {
    console.error("Error fetching crypto prices:", error)
    // Return mock data as fallback
    return NextResponse.json(mockCryptoPrices)
  }
}
