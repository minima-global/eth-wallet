import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { USDT_TOKEN, WRAPPED_MINIMA_TOKEN } from '../../constants'

// Inputs that configure this example to run
export interface ExampleConfig {
  rpc: {
    local: string
    mainnet: string
  }
  tokens: {
    in: Token
    amountIn: number
    out: Token
    poolFee: number
  }
}

// Example Configuration
// TODO.. make mainnet/local/test network configurable
export const CurrentConfig: ExampleConfig = {
  rpc: {
    local: 'http://localhost:8545',
    mainnet: 'https://mainnet.infura.io/v3/05c98544804b478994665892aeff361c',
  },
  tokens: {
    in: WRAPPED_MINIMA_TOKEN,
    amountIn: 1000,
    out: USDT_TOKEN,
    poolFee: FeeAmount.HIGH,
  },
}
