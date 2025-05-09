import { createFileRoute } from '@tanstack/react-router'
import { Network } from 'alchemy-sdk'
import { useState } from 'react'
import { Chain } from 'viem/chains'
import { RecoveryButton } from '~/_components/recover/recover-button.tsx'
import {
  ALCHEMY_API_KEY,
  ALCHEMY_PROXY_URL,
  OSMOSIS_AXELAR_ETH_USDC,
  OSMOSIS_CHAIN_ID,
  OSMOSIS_NOBLE_USDC,
  SUPPORTED_EVM_CHAINS,
} from '../constants.ts'
import { Accounts } from './_components/accounts'
import AssetsTable from './_components/assets-table'
import { useRecoveryDialogStore } from './_components/recover/recover-dialog.tsx'
import { SendDialog } from './_components/send-dialog'
import { TransactionStatus } from './_components/transaction-status.tsx'
import { TokenWithPrice } from './_hooks/use-tokens'
import {
  AlchemyMultichainClient,
  AlchemyMultichainSettings,
} from './_lib/alchemy-multichain-client.ts'
import { useSkipClient } from './_lib/skip-client.tsx'
import { useTransactionStore } from './_stores/transaction-store.ts'

export const Route = createFileRoute('/')({
  component: () => <Dashboard />,
})

const alchemyConfig: AlchemyMultichainSettings = {
  apiKey: ALCHEMY_API_KEY,
}

export const EVM_CHAINS_BY_ID = SUPPORTED_EVM_CHAINS.reduce(
  (acc, chain) => {
    acc[chain.id.toString()] = chain
    return acc
  },
  {} as Record<string, Chain & { alchemyNetwork: Network }>,
)

export const apiKeyOverrides = SUPPORTED_EVM_CHAINS.reduce(
  (acc, chain) => {
    acc[chain.alchemyNetwork] = {
      apiKey: ALCHEMY_API_KEY,
      url: ALCHEMY_PROXY_URL ? `${ALCHEMY_PROXY_URL}/${chain.alchemyNetwork}` : undefined,
    }
    return acc
  },
  {} as Record<string, { apiKey: string; url: string | undefined }>,
)

export const alchemy = new AlchemyMultichainClient(alchemyConfig, apiKeyOverrides)

function Dashboard() {
  const [assetToDeposit, setAssetToDeposit] = useState<TokenWithPrice | null>(null)
  const { setIsOpen: setRecoveryOpen } = useRecoveryDialogStore()

  const skippy = useSkipClient()

  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const _updateTransactionExplorerLink = useTransactionStore(
    (state) => state.updateTransactionExplorerLink,
  )

  return (
    <div className="flex flex-col gap-2 lg:gap-12">
      <div className="flex flex-col items-center justify-center gap-12">
        <h1 className="text-5xl font-bold gap-2">
          Get XION<span className="text-2xl font-normal text-gray-500"> Beta</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-md text-center">
          Seamlessly bridge & swap any token to $XION directly into your XION Meta Account.
        </p>

        <Accounts />
      </div>

      <TransactionStatus />

      <div className="w-full max-w-[920px] mx-auto">
        <h4 className="text-base leading-none font-semibold px-1 pb-4">
          3. Click deposit to bridge & swap tokens to $XION
        </h4>
        <AssetsTable setAssetToDeposit={setAssetToDeposit} />
      </div>
      <SendDialog assetToDeposit={assetToDeposit} setAssetToDeposit={setAssetToDeposit} />
      {/* DEVELOPER TEST THINGS */}
      {import.meta.env.DEV && (
        <div>
          <RecoveryButton
            hostChainId={OSMOSIS_CHAIN_ID}
            hostAssetDenom={OSMOSIS_NOBLE_USDC}
            amount={'100'}
            symbol={'USDC.noble'}
          />
          <RecoveryButton
            hostChainId={OSMOSIS_CHAIN_ID}
            hostAssetDenom={OSMOSIS_AXELAR_ETH_USDC}
            amount={'100'}
            symbol={'USDC.axl.eth'}
          />
          <button type="button" onClick={() => setRecoveryOpen(true)}>
            Dialog
          </button>
          <button
            type="button"
            onClick={async () => {
              const res = await skippy.trackTransaction({
                txHash: '9E5F3C0640E4819F1D9B126631E53BBC07C054A1434CECD14A208DE7572C48A5',
                chainID: 'xion-mainnet-1',
              })
              console.log('res', res)

              const stat = await skippy.transactionStatus({
                txHash: '9E5F3C0640E4819F1D9B126631E53BBC07C054A1434CECD14A208DE7572C48A5',
                chainID: 'xion-mainnet-1',
              })

              console.log('stat', stat)
            }}
          >
            TRacker
          </button>
          <button
            type="button"
            onClick={async () => {
              const res = await skippy.trackTransaction({
                txHash: '0x32665e339661e3b42a40504d3cd8bee08abae667a792f5125b8c12d01d0feba3',
                chainID: '1',
              })
              console.log('res', res)

              const stat = await skippy.transactionStatus({
                txHash: '0x32665e339661e3b42a40504d3cd8bee08abae667a792f5125b8c12d01d0feba3',
                chainID: '1',
              })

              console.log('stat', stat)
            }}
          >
            Failed
          </button>
          <button
            type="button"
            onClick={async () => {
              const res = await skippy.trackTransaction({
                txHash: '0x2be04d420f7aeb613745a006cbaac794534d8a2897ecbe5761c2398ba54f04c8',
                chainID: '137',
              })
              console.log('res', res)

              const stat = await skippy.transactionStatus({
                txHash: '0x2be04d420f7aeb613745a006cbaac794534d8a2897ecbe5761c2398ba54f04c8',
                chainID: '137',
              })

              addTransaction({
                sourceAsset: {
                  symbol: 'USDC',
                  denom: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
                  chainId: '137',
                  amount: '0.1',
                },
                destAsset: {
                  symbol: 'XION',
                  denom: 'uxion',
                  chainId: 'xion-mainnet-1',
                  amount: '0.003',
                },
                txHash: '0xca36b2b08401eff775cc2613ae588613d1a64480f3fbcd11d3c5f51a6daee47b',
                chainID: '137',
                timestamp: 0,
              })

              console.log('stat', stat)
            }}
          >
            Track
          </button>
        </div>
      )}
    </div>
  )
}
