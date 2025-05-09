import { AccountTypes } from '@abstract-money/core/codegen/abstract'
import { cosmosWasmExecuteMsg } from '@abstract-money/core/utils'
import { Button } from '@abstract-money/ui'
import { useAbstraxionAccount, useAbstraxionSigningClient, useModal } from '@burnt-labs/abstraxion'
import { CosmWasmClient, ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { fromUtf8 } from '@cosmjs/encoding'
import { useMutation } from '@tanstack/react-query'
import { useCosmWasmClient } from 'graz'

import { findAttribute } from '@abstract-money/core'
import { useToaster } from '@abstract-money/ui'
import {
  getPolytoneConfig,
  usePolytoneRecoveryAddress,
} from '~/_hooks/use-polytone-recovery-address.ts'
import { simulatePolytoneVoiceCosmosMsgs } from '~/_lib/simulate-polytone-voice-cosmos-msgs.ts'
import {
  OSMOSIS_4ETH_POOL_ID,
  OSMOSIS_ALLOYED_ETH,
  OSMOSIS_ASSETS,
  OSMOSIS_AXELAR_ETH,
  OSMOSIS_AXELAR_ETH_USDC,
  OSMOSIS_CHAIN_ID,
  OSMOSIS_ETH_USDC_POOL_ID,
  OSMOSIS_OSMO_XION_POOL_ID,
  OSMOSIS_SKIP_SWAP_ENTRY_POINT,
  OSMOSIS_UDSCETH_USDC_POOL_ID,
  OSMOSIS_XION_USDC_POOL_ID,
  POLYTONE_CONFIG,
  XION_CHAIN_ID,
  getIcs20Channel,
} from '../../constants.ts'

interface UseRecoverAssetViaPolytone {
  controllerChainId: string
  hostChainId: string
}

async function getBlockTimestampIn1Hour(hostChainClient: { getBlock: CosmWasmClient['getBlock'] }) {
  const blockTimestamp = await hostChainClient.getBlock().then((block) => block.header.time)
  return Date.parse(blockTimestamp) * 1_000_000 + 1000 * 60 * 10 * 1_000_000 // 10 mins in nanoseconds
}

export const useRecoverAssetViaPolytone = ({
  hostChainId,
  controllerChainId,
}: UseRecoverAssetViaPolytone) => {
  const { data: hostChainClient } = useCosmWasmClient({
    multiChain: false,
    chainId: hostChainId,
  })

  const {
    data: { bech32Address: xionAddress },
  } = useAbstraxionAccount()

  const { data: hostRecoveryAddress } = usePolytoneRecoveryAddress({
    sender: xionAddress,
    hostChainId,
    controllerChainId,
  })

  const { client: xionClient, logout } = useAbstraxionSigningClient()
  const [, setOpenXionModal] = useModal()
  const { toast } = useToaster()

  const mutation = useMutation({
    mutationKey: ['recoverAssetViaPolytone', controllerChainId, hostChainId],
    mutationFn: async ({ hostAssetDenom, amount }: { hostAssetDenom: string; amount: string }) => {
      if (!xionClient) throw new Error('No XION client found')
      if (!hostChainClient) throw new Error(`No host chain client found for ${hostChainId}`)

      if (!hostRecoveryAddress) throw new Error('No host recovery address found')

      if (controllerChainId !== XION_CHAIN_ID) {
        throw new Error('useRecoverAssetViaPolytone only supports XION mainnet controller ')
      } else if (hostChainId !== OSMOSIS_CHAIN_ID) {
        throw new Error('useRecoverAssetViaPolytone only supports osmosis-1 host chain')
      }

      const { srcToDstConnection } = getPolytoneConfig({ controllerChainId, hostChainId })
      const srcConfig = POLYTONE_CONFIG[controllerChainId]
      if (!srcConfig) throw new Error(`No Polytone config found for chain ${controllerChainId}`)

      const messages: AccountTypes.CosmosMsgForEmpty[] = []

      const _hostChainTimeout = await getBlockTimestampIn1Hour(hostChainClient)
      // const _nobleTimeout = await getBlockTimestampIn1Hour(nobleChainClient)

      const baseActionMessage = {
        swap_and_action: {
          user_swap: {
            swap_exact_asset_in: {
              swap_venue_name: 'osmosis-poolmanager',
              operations: [
                // empty operations
              ] as { pool: string; denom_in: string; denom_out: string }[],
            },
          },
          min_asset: {
            native: {
              denom: OSMOSIS_ASSETS.XION_XION,
              // TODO: simulate
              amount: '1',
            },
          },
          timeout_timestamp: _hostChainTimeout,
          post_swap_action: {
            ibc_transfer: {
              ibc_info: {
                source_channel: getIcs20Channel(hostChainId, controllerChainId),
                receiver: xionAddress,
                memo: '',
                recover_address: hostRecoveryAddress,
              },
            },
          },
          affiliates: [],
        },
      }

      if (hostAssetDenom === OSMOSIS_AXELAR_ETH_USDC) {
        baseActionMessage.swap_and_action.user_swap.swap_exact_asset_in.operations.push(
          ...[
            {
              pool: OSMOSIS_UDSCETH_USDC_POOL_ID,
              denom_in: OSMOSIS_AXELAR_ETH_USDC,
              denom_out: OSMOSIS_ASSETS.NOBLE_USDC,
            },
            {
              pool: OSMOSIS_XION_USDC_POOL_ID,
              denom_in: OSMOSIS_ASSETS.NOBLE_USDC,
              denom_out: OSMOSIS_ASSETS.XION_XION,
            },
          ],
        )
      } else if (hostAssetDenom === OSMOSIS_AXELAR_ETH) {
        baseActionMessage.swap_and_action.user_swap.swap_exact_asset_in.operations.push(
          ...[
            {
              pool: OSMOSIS_4ETH_POOL_ID,
              denom_in: OSMOSIS_AXELAR_ETH,
              denom_out: OSMOSIS_ALLOYED_ETH,
            },
            {
              pool: OSMOSIS_ETH_USDC_POOL_ID,
              denom_in: OSMOSIS_ALLOYED_ETH,
              denom_out: OSMOSIS_ASSETS.NOBLE_USDC,
            },
            {
              pool: OSMOSIS_XION_USDC_POOL_ID,
              denom_in: OSMOSIS_ASSETS.NOBLE_USDC,
              denom_out: OSMOSIS_ASSETS.XION_XION,
            },
          ],
        )
      } else if (hostAssetDenom === OSMOSIS_ASSETS.NOBLE_USDC) {
        baseActionMessage.swap_and_action.user_swap.swap_exact_asset_in.operations.push({
          pool: OSMOSIS_XION_USDC_POOL_ID,
          denom_in: OSMOSIS_ASSETS.NOBLE_USDC,
          denom_out: OSMOSIS_ASSETS.XION_XION,
        })
      } else if (hostAssetDenom === 'uosmo') {
        baseActionMessage.swap_and_action.user_swap.swap_exact_asset_in.operations.push({
          pool: OSMOSIS_OSMO_XION_POOL_ID,
          denom_in: 'uosmo',
          denom_out: OSMOSIS_ASSETS.XION_XION,
        })
      } else if (hostAssetDenom !== OSMOSIS_ASSETS.XION_XION) {
        throw new Error(`Unsupported asset ${hostAssetDenom}`)
      }

      console.debug('baseActionMessage', baseActionMessage)

      const swapAndSendMessage = cosmosWasmExecuteMsg(
        OSMOSIS_SKIP_SWAP_ENTRY_POINT,
        baseActionMessage,
        [
          {
            denom: hostAssetDenom,
            amount: amount,
          },
        ],
      )

      messages.push(swapAndSendMessage)

      const simulationResult = await simulatePolytoneVoiceCosmosMsgs({
        hostCosmWasmClient: hostChainClient,
        hostVoiceAddress: srcToDstConnection.voice,
        controllerSender: xionAddress,
        controllerNoteAddress: srcConfig.note,
        hostVoiceConnectionId: srcToDstConnection.connectionId,
        msgs: messages,
      })

      console.debug('simulationResult', simulationResult)

      const isFailure = simulationResult.result?.events
        ?.filter(({ type }) => type === 'wasm')
        ?.flatMap(({ attributes }) => attributes)
        ?.find(({ key, value }) => key === 'method' && value === 'reply_forward_data_error')
      if (isFailure) {
        console.debug(
          'debugged',
          simulationResult?.result?.data ? fromUtf8(simulationResult.result.data) : '',
        )
        throw new Error('Simulation failed. Please contact XION support')
      }

      let simulatedAmount = '0'
      try {
        simulatedAmount =
          findAttribute(simulationResult.result?.events, 'ibc_transfer', 'amount')?.value ?? '0'
      } catch (e) {
        console.debug('Error finding amount of XION', e)
      }

      const result = await xionClient.execute(
        xionAddress,
        srcConfig.note,
        {
          execute: {
            msgs: messages,
            timeout_seconds: '60',
          },
        },
        'auto',
      )

      return {
        amount: simulatedAmount,
        ...result,
      } as { amount: string } & ExecuteResult
    },
    onError: (e) => {
      if (e instanceof Error && e.message.includes('fee-grant not found: not found')) {
        toast({
          variant: 'warning',
          title: 'Info',
          description: 'XION reauthentication needed.',
          action: (
            <Button
              onClick={() => {
                logout?.()
                setTimeout(() => setOpenXionModal(true), 1000)
              }}
            >
              Reauth
            </Button>
          ),
        })
        return
      }
    },
  })

  return {
    enabled: !!xionClient,
    ...mutation,
  }
}
