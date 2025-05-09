import { Network } from 'alchemy-sdk'
import { Chain, arbitrum, avalanche, base, mainnet, optimism, polygon } from 'wagmi/chains'

export interface ChainConfig {
  mainnet: {
    chain: Chain
    network: Network
    nativeToken: {
      name: string
      contractAddress: string
    }
  }
}

// TODO: merge with constants / supported-chains
export const chainConfigs: Record<string, ChainConfig> = {
  ethereum: {
    mainnet: {
      chain: mainnet,
      network: Network.ETH_MAINNET,
      nativeToken: {
        name: 'Ether',
        contractAddress: 'ethereum-native',
      },
    },
  },
  polygon: {
    mainnet: {
      chain: polygon,
      network: Network.MATIC_MAINNET,
      nativeToken: {
        name: 'Matic',
        contractAddress: 'polygon-native',
      },
    },
  },
  arbitrum: {
    mainnet: {
      chain: arbitrum,
      network: Network.ARB_MAINNET,
      nativeToken: {
        name: 'Arbitrum',
        contractAddress: 'arbitrum-native',
      },
    },
  },
  avalanche: {
    mainnet: {
      chain: avalanche,
      network: Network.AVAX_MAINNET,
      nativeToken: {
        name: 'Avalanche',
        contractAddress: 'avalanche-native',
      },
    },
  },
  base: {
    mainnet: {
      chain: base,
      network: Network.BASE_MAINNET,
      nativeToken: {
        name: 'Base',
        contractAddress: 'base-native',
      },
    },
  },
  optimism: {
    mainnet: {
      chain: optimism,
      network: Network.OPT_MAINNET,
      nativeToken: {
        name: 'Optimism',
        contractAddress: 'optimism-native',
      },
    },
  },
}
