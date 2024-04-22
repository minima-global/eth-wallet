import { Token, TradeType } from '@uniswap/sdk-core'
import { Trade } from '@uniswap/v3-sdk'
import { formatUnits } from 'ethers'
import { ethers } from 'ethers-5'

const MAX_DECIMALS = 4


export function fromReadableAmount(
  amount: string,
  decimals: number
) {
  return ethers.utils.parseUnits(amount, decimals)
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals).slice(0, MAX_DECIMALS)
}

export function displayTrade(trade: Trade<Token, Token, TradeType>): string {
  return `${trade.inputAmount.toExact()} ${
    trade.inputAmount.currency.symbol
  } for ${trade.outputAmount.toExact()} ${trade.outputAmount.currency.symbol}`
}
