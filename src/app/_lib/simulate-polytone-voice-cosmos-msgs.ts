import { cosmosWasmExecuteMsg, jsonToBinary } from '@abstract-money/core'
import { AccountTypes } from '@abstract-money/core/codegen/abstract'
import { simulateWasmCosmosMsgs } from '@abstract-money/core/utils'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export type SimulatePolytoneCosmosMsgParameters = {
  hostCosmWasmClient: CosmWasmClient
  controllerSender: string
  controllerNoteAddress: string
  hostVoiceAddress: string
  hostVoiceConnectionId: `connection-${string}`
  msgs: Array<AccountTypes.CosmosMsgForEmpty>
}

/**
 * Simulate messages to be executed on a the host polytone voice chain.
 * @param msgs
 * @experimental
 */
export async function simulatePolytoneVoiceCosmosMsgs({
  hostCosmWasmClient,
  hostVoiceAddress,
  controllerNoteAddress,
  controllerSender,
  hostVoiceConnectionId,
  msgs,
}: SimulatePolytoneCosmosMsgParameters) {
  const voiceMsg = cosmosWasmExecuteMsg(
    hostVoiceAddress,
    {
      rx: {
        connection_id: hostVoiceConnectionId,
        counterparty_port: `wasm.${controllerNoteAddress}`,
        data: jsonToBinary({
          sender: controllerSender,
          msg: {
            execute: {
              msgs: Array.isArray(msgs) ? msgs : [msgs],
            },
          },
        }),
      },
    },
    [],
  )

  return await simulateWasmCosmosMsgs(
    // biome-ignore lint/complexity/useLiteralKeys: private
    hostCosmWasmClient['cometClient'],
    [voiceMsg],
    hostVoiceAddress,
  )
}
