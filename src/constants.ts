import { Network } from 'alchemy-sdk'
import { arbitrum, avalanche, base, mainnet, optimism, polygon } from 'viem/chains'

export const {
  ABSTRACT_DEFAULT_CHAIN_NAME,
  ABSTRACT_SUBGRAPH_URL,
  ABSTRACT_ALCHEMY_API_KEY: ALCHEMY_API_KEY,
  ABSTRACT_ALCHEMY_PROXY_URL: ALCHEMY_PROXY_URL,
} = import.meta.env

/// Note that we also have {@link chainConfigs}!!!
export const SUPPORTED_EVM_CHAINS = [
  { ...mainnet, alchemyNetwork: Network.ETH_MAINNET },
  { ...polygon, alchemyNetwork: Network.MATIC_MAINNET },
  { ...arbitrum, alchemyNetwork: Network.ARB_MAINNET },
  { ...avalanche, alchemyNetwork: Network.AVAX_MAINNET },
  { ...base, alchemyNetwork: Network.BASE_MAINNET },
  { ...optimism, alchemyNetwork: Network.OPT_MAINNET },
] as const

export const XION_CHAIN_ID = 'xion-mainnet-1'
export const OSMOSIS_CHAIN_ID = 'osmosis-1'
export const NOBLE_CHAIN_ID = 'noble-1'
export const XION_ASSET_DENOM = 'uxion'

export const ICS20_CHANNELS: Record<string, Record<string, `channel-${string}`>> = {
  [XION_CHAIN_ID]: {
    [OSMOSIS_CHAIN_ID]: 'channel-1',
  },
  [NOBLE_CHAIN_ID]: {
    [XION_CHAIN_ID]: 'channel-113',
  },
  [OSMOSIS_CHAIN_ID]: {
    [XION_CHAIN_ID]: 'channel-89321',
    [NOBLE_CHAIN_ID]: 'channel-750',
  },
} as const

export const getIcs20Channel = (srcChainId: string, dstChainId: string): `channel-${string}` => {
  const channel = ICS20_CHANNELS[srcChainId]?.[dstChainId]
  if (!channel) {
    throw new Error(`No ICS20 channel found for ${srcChainId} -> ${dstChainId}`)
  }
  return channel
}

export const POLYTONE_CONFIG: Record<
  string,
  {
    note: string
    proxyChecksum: string
    connections: Record<
      string,
      {
        voice: string
        connectionId: `connection-${string}`
      }
    >
  }
> = {
  [XION_CHAIN_ID]: {
    note: 'xion1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkges7as2wd',
    proxyChecksum: '54E909B7F9AB191A0A0DB2040E09C8CFAB45DB75CA22852098531EC301878FC2',
    connections: {
      [OSMOSIS_CHAIN_ID]: {
        voice: 'osmo1pd2tw9230k9qhzq046yrkel940x93732pq5c3mcqrnahj3ekhw7q64tfwr',
        connectionId: 'connection-2823',
      },
    },
  },
  [OSMOSIS_CHAIN_ID]: {
    note: 'osmo1qsx3zmwcfayl3d27mf22f4d4mc0ge727vfga2553533lzcawsw7q8ufall',
    proxyChecksum: '5094551145BCD256538775A0611CE9E88F8D7A182A06F082F901FFED9184BB5A',
    connections: {
      [XION_CHAIN_ID]: {
        voice: 'xion1mv8luxmtt2afvvldtufg9ht8ut9ff6r4tpqac8792f4efhdg04kqkmg7e0',
        connectionId: 'connection-UNKNOWN',
      },
    },
  },
} as const

// TODO: these are abstract addresses, need to get real addresses somehow?
export const AXELAR_RECOVERY_ADDRESS = 'axelar14cl2dthqamgucg9sfvv4relp3aa83e4035jp0l'
export const NOBLE_RECOVERY_ADDRESS = 'noble14cl2dthqamgucg9sfvv4relp3aa83e40ae3pus'

export const OSMOSIS_DEX_ADAPTER_ADDRESS =
  'osmo19s7q2242zfq4c8hq4g2jch6u8ahe24t082hj87uwysylndp8fajs5qc0y5'
export const OSMOSIS_SKIP_SWAP_ENTRY_POINT =
  'osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u'
export const OSMOSIS_AXELAR_ETH_USDC =
  'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858'
export const OSMOSIS_AXELAR_ETH =
  'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5'
export const OSMOSIS_NOBLE_USDC =
  'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4'
export const OSMOSIS_ALLOYED_ETH =
  'factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH'

export const OSMOSIS_XION_XION =
  'ibc/2E3784772E70F7B3A638BA88F65C8BE125D3CDB6E28C6AABC51098C94F5E16A5'

export const OSMOSIS_ASSETS = {
  AXELAR_ETH_USDC: OSMOSIS_AXELAR_ETH_USDC,
  AXELAR_ETH: OSMOSIS_AXELAR_ETH,
  NOBLE_USDC: OSMOSIS_NOBLE_USDC,
  ALLOYED_ETH: OSMOSIS_ALLOYED_ETH,
  XION_XION: OSMOSIS_XION_XION,
}

export const OSMO_LOGO_URL =
  'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png'
export const XION_LOGO_URL =
  'https://raw.githubusercontent.com/cosmos/chain-registry/master/xion/images/burnt-round.png'

export const OSMOSIS_XION_USDC_POOL_ID = '2444'
export const OSMOSIS_UDSCETH_USDC_POOL_ID = '1212'
export const OSMOSIS_OSMO_XION_POOL_ID = '2484'
export const OSMOSIS_4ETH_POOL_ID = '1878'
export const OSMOSIS_ETH_USDC_POOL_ID = '1948'
