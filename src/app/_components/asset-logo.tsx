import AvalancheLogo from 'cryptocurrency-icons/svg/color/avax.svg'
import GenericLogo from 'cryptocurrency-icons/svg/color/generic.svg'
import UsdcLogo from 'cryptocurrency-icons/svg/color/usdc.svg'
import { useTokenMetadata } from '~/_hooks/use-token-metadata.ts'
import { ArbMainnetIcon } from '../../assets/arb-mainnet-icon.tsx'
import { EthMainnetIcon } from '../../assets/eth-mainnet-icon.tsx'
import { MaticMainnetIcon } from '../../assets/matic-mainnet-icon.tsx'
import OpMainnetIcon from '../../assets/op-mainnet-icon.tsx'
import { OSMO_LOGO_URL, XION_LOGO_URL } from '../../constants.ts'

export const assetLogoBySymbol = (symbol: string) => {
  return symbol === 'ETH' ? (
    <EthMainnetIcon />
  ) : symbol === 'POL' ? (
    <MaticMainnetIcon />
  ) : symbol === 'OP' ? (
    <OpMainnetIcon />
  ) : symbol === 'ARB' ? (
    <ArbMainnetIcon />
  ) : symbol === 'AVAX' ? (
    <img src={AvalancheLogo} alt={symbol} className="w-8 h-8 rounded-full" />
  ) : symbol?.toUpperCase()?.includes('USDC') ? (
    <img src={UsdcLogo} alt={symbol} className="w-8 h-8 rounded-full" />
  ) : symbol === 'XION' ? (
    <img src={XION_LOGO_URL} alt={symbol} className="w-8 h-8 rounded-full" />
  ) : symbol === 'OSMO' ? (
    <img src={OSMO_LOGO_URL} alt={symbol} className="w-8 h-8 rounded-full" />
  ) : null
}

export const AssetLogo: React.FC<{
  icon?: string
  symbol?: string
  chainId: number
  address: string
}> = ({ icon, symbol, chainId, address }) => {
  const { data: tokenMetadata } = useTokenMetadata(chainId, address)

  return symbol && assetLogoBySymbol(symbol) ? (
    assetLogoBySymbol(symbol)
  ) : icon || tokenMetadata?.logo ? (
    <img
      src={icon || (tokenMetadata?.logo ?? undefined)}
      alt={symbol}
      className="w-8 h-8 rounded-full"
    />
  ) : (
    <img src={GenericLogo} alt={symbol} className="w-8 h-8 rounded-full" />
  )
}
