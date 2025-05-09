import { predictPolytoneProxyAddress } from '@abstract-money/core/utils'
import { useQuery } from '@tanstack/react-query'
import { POLYTONE_CONFIG } from '../../constants.ts'

export const getPolytoneRecoveryAddress = async ({
  sender,
  hostChainId,
  controllerChainId,
}: {
  sender: string
  hostChainId: keyof typeof POLYTONE_CONFIG
  controllerChainId: keyof typeof POLYTONE_CONFIG
}) => {
  const { srcConfig, srcToDstConnection, dstConfig } = getPolytoneConfig({
    controllerChainId,
    hostChainId,
  })

  return await predictPolytoneProxyAddress({
    controllerNoteAddress: srcConfig.note,
    controllerSender: sender,
    hostVoiceAddress: srcToDstConnection.voice,
    hostVoiceConnectionId: srcToDstConnection.connectionId,
    hostProxyChecksum: dstConfig.proxyChecksum,
  })
}

export const usePolytoneRecoveryAddress = ({
  sender,
  hostChainId,
  controllerChainId,
}: { sender: string | undefined; hostChainId: string; controllerChainId: string }) => {
  return useQuery({
    queryKey: ['recovery-address', sender, controllerChainId, hostChainId],
    queryFn: async () => {
      if (!sender) {
        throw new Error('No sender provided')
      }

      return await getPolytoneRecoveryAddress({
        sender,
        hostChainId: hostChainId,
        controllerChainId: controllerChainId,
      })
    },
    enabled: !!sender && !!hostChainId,
  })
}

export function getPolytoneConfig({
  controllerChainId,
  hostChainId,
}: { controllerChainId: string; hostChainId: string }) {
  const srcConfig = POLYTONE_CONFIG[controllerChainId]
  if (!srcConfig) throw new Error(`No Polytone config found for chain ${controllerChainId}`)

  const srcToDstConnection =
    srcConfig.connections[hostChainId as keyof typeof srcConfig.connections]
  if (!srcToDstConnection)
    throw new Error(
      `No Polytone connection from ${controllerChainId} found for chain ${hostChainId}`,
    )

  const dstConfig = POLYTONE_CONFIG[hostChainId]
  if (!dstConfig) throw new Error(`No Polytone config found for chain ${hostChainId}`)
  return { srcConfig, srcToDstConnection, dstConfig }
}
