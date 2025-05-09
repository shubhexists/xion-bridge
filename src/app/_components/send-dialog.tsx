import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@abstract-money/ui/components'
import { useAbstraxionAccount } from '@burnt-labs/abstraxion'
import { zodResolver } from '@hookform/resolvers/zod'
import { RouteResponse, Swap } from '@skip-go/client'
import { useIsMutating, useMutation } from '@tanstack/react-query'
import { EVM_CHAINS_BY_ID } from 'app'
import { TokenWithPrice, useTokens } from 'app/_hooks/use-tokens'
import { getEVMToRoute, useSkipClient } from 'app/_lib/skip-client'
import { useTransactionStore } from 'app/_stores/transaction-store.ts'
import { WalletIcon } from 'assets/wallet-icon'
import { XionFlame } from 'assets/xion-flame'
import { BigNumber } from 'bignumber.js'
import { LucideAlertCircle, LucideAlertTriangle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi'
import { z } from 'zod'
import { AssetLogo } from '~/_components/asset-logo.tsx'
import FeeList from '~/_components/fee-list.tsx'
import { useGetAddress } from '~/_hooks/use-get-address.ts'
import { useXionBalance } from '~/_hooks/use-xion-balance.ts'
import { debounce } from '~/_lib/debounce.ts'
import { truncateAddress } from '~/_lib/utils.ts'
import { XION_ASSET_DENOM, XION_CHAIN_ID } from '../../constants.ts'
import { config } from '../../wagmi-config.ts'
import { Spinner } from './spinner'

interface SendDialogProps {
  assetToDeposit: TokenWithPrice | null
  setAssetToDeposit: (asset: TokenWithPrice | null) => void
}

export const SendDialog = ({ assetToDeposit, setAssetToDeposit }: SendDialogProps) => {
  const {
    data: { bech32Address: xionAddress },
  } = useAbstraxionAccount()
  const [route, setRoute] = useState<RouteResponse | undefined>(undefined)
  const [feesExpanded, setFeesExpanded] = useState(false)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [routeCache, setRouteCache] = useState<{
    key: string
    route: RouteResponse
  } | null>(null)
  const { data: walletClient } = useWalletClient()
  const { address: evmAddress } = useAccount()
  const currentChainId = useChainId()
  const { refresh: refreshEvmBalances } = useTokens(evmAddress)

  const skippy = useSkipClient()

  const assetToDepositBalance: number = Number(assetToDeposit?.balance) ?? 0

  const {
    formState: { errors, isValid, isSubmitting },
    register,
    setValue,
    reset,
    handleSubmit,
    setError,
    watch,
  } = useForm<{ amount: number; route: string | undefined }>({
    context: assetToDeposit,
    resolver: zodResolver(
      z.object({
        amount: z
          .number()
          .positive('Amount must be greater than 0')
          .lte(assetToDepositBalance, 'Insufficient balance'),
        route: z.string().optional(),
      }),
    ),
    mode: 'onChange',
  })

  const getRoute = useCallback(
    async (amount: number) => {
      if (!assetToDeposit?.symbol || !assetToDeposit?.chainId) return

      const cacheKey = `${amount}-${assetToDeposit.symbol}-${assetToDeposit.chainId}`

      if (routeCache?.key === cacheKey) {
        console.debug('Using cached route')
        setRoute(routeCache.route)
        return routeCache.route
      }

      setLoadingRoute(true)
      reset({
        route: undefined,
      })

      try {
        if (amount <= 0) {
          throw new Error('Amount must be greater than 0')
        }
        const holding = BigNumber(amount).multipliedBy(
          BigNumber(10).pow(assetToDeposit?.decimals ?? 18),
        )

        const route = await getEVMToRoute({
          client: skippy,
          sourceAssetDenom: assetToDeposit.contractAddress,
          sourceAssetChainID: assetToDeposit.chainId.toString(),
          destAssetDenom: XION_ASSET_DENOM,
          destAssetChainID: XION_CHAIN_ID,
          amountIn: holding.toFixed(),
        })

        setRouteCache({ key: cacheKey, route })
        setRoute(route)
        return route
      } catch (e) {
        console.error('Error fetching route', e)
        if (e instanceof Error) {
          if (e.message === 'no routes found') {
            setError('route', { message: `No route found for ${assetToDeposit.symbol}` })
          } else {
            setError('route', { message: e.message })
          }
        }
      } finally {
        setLoadingRoute(false)
      }
    },
    [assetToDeposit, skippy, routeCache, setError, reset],
  )

  const amount = watch('amount')

  useEffect(() => {
    if (amount && isValid && amount <= assetToDepositBalance) {
      debounce(getRoute, 1000, { leading: true })(amount)
    }
  }, [amount, isValid, getRoute, assetToDepositBalance])

  const { getAddressForChain } = useGetAddress()

  const { refetch: refetchXionBalance } = useXionBalance()

  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const updateTransactionExplorerLink = useTransactionStore(
    (state) => state.updateTransactionExplorerLink,
  )

  const assetIsRouting = Boolean(
    useIsMutating(['routeMutation'], {
      exact: false,
      predicate: (mutation) => {
        const { depositAsset, amount: mutationAmount } = mutation.state.variables || {}

        return depositAsset?.symbol === assetToDeposit?.symbol && mutationAmount === amount
      },
    }),
  )

  const { switchChainAsync } = useSwitchChain({ config })

  const routeMutation = useMutation({
    mutationKey: ['routeMutation', assetToDeposit?.symbol, amount],
    mutationFn: async ({
      depositAsset,
      amount,
    }: { depositAsset: TokenWithPrice; amount: number }) => {
      const route = await getRoute(amount)
      if (!route || !depositAsset) {
        throw new Error('No route found or no asset selected')
      }
      if (!walletClient) {
        throw new Error('No wallet client found. Try again.')
      }

      console.debug('Route', { route })
      // get user addresses for each requiredChainAddress to execute the route
      const userAddresses = await Promise.all(
        route.requiredChainAddresses.map(async (chainID) => ({
          chainID,
          address: await getAddressForChain(chainID),
        })),
      )

      console.debug({ userAddresses }, 'userAddresses')

      const chainId = depositAsset.chainId
      if (!EVM_CHAINS_BY_ID[chainId.toString()]) {
        throw new Error(`Invalid chain ID: ${chainId}`)
      }

      // sanity check
      await switchChainAsync({
        // @ts-ignore
        chainId,
      })

      console.debug('swapped chain', { chainId })

      return await skippy.executeRoute({
        route,
        userAddresses,
        getEVMSigner: async () => {
          return Promise.resolve(walletClient)
        },
        onTransactionBroadcast: async ({ txHash, chainID }) => {
          console.debug('onTransactionBroadcast', { txHash, chainID })
          // toast({
          //   title: 'Transaction Broadcast',
          //   description: `Transaction initiated on ${chainID}`,
          //   duration: 3000,
          // })
        },
        onTransactionTracked: async ({ txHash, chainID, explorerLink }) => {
          console.debug('onTransactionTracked', { txHash, chainID, explorerLink })

          addTransaction({
            txHash,
            chainID,
            timestamp: Date.now(),
            sourceAsset: {
              symbol: depositAsset.symbol,
              denom: route.sourceAssetDenom,
              amount: route.amountIn,
              chainId: route.sourceAssetChainID,
            },
            destAsset: {
              symbol: 'XION',
              denom: route.destAssetDenom,
              amount: route.amountOut,
              chainId: route.destAssetChainID,
            },
          })

          if (explorerLink) {
            updateTransactionExplorerLink(txHash, explorerLink)
          }

          setAssetToDeposit(null)
        },
        onTransactionCompleted: async (chainId, transactionHash, txStatus) => {
          console.debug('onTransactionCompleted', { chainId, transactionHash, txStatus })
          await refetchXionBalance()
          if (Number.isInteger(route.sourceAssetChainID)) {
            refreshEvmBalances.chain(+route.sourceAssetChainID, evmAddress)
          }
        },
      })
    },
    onSuccess: (_, params) => {
      setAssetToDeposit(null)
      refreshEvmBalances.chain(params.depositAsset.chainId, evmAddress)
    },
  })

  const needsSwitchChain = currentChainId !== assetToDeposit?.chainId

  const handleSend = async ({ amount }: { amount: number }) => {
    if (!assetToDeposit) {
      console.error('No asset selected')
      return
    }
    if (needsSwitchChain) {
      return switchChainAsync({
        // @ts-ignore
        chainId: assetToDeposit.chainId,
      })
    }
    console.debug('sending', { assetToDeposit, amount })
    await routeMutation.mutateAsync({ depositAsset: assetToDeposit, amount })
  }

  const knownSlippage = useMemo(() => {
    if (routeMutation.isLoading) return undefined
    if (!route) return undefined

    if (route.swapPriceImpactPercent) return Number(route.swapPriceImpactPercent)

    const priceImpacts = route.operations
      .filter(
        (
          op,
        ): op is {
          swap: Swap
          txIndex: number
          amountIn: string
          amountOut: string
        } => 'swap' in op,
      )
      ?.map(({ swap }) => swap)
      .map((swap) =>
        'swapIn' in swap ? swap.swapIn : 'swapOut' in swap ? swap.swapOut : undefined,
      )
      .map((swapIn) => swapIn?.priceImpactPercent)
      .filter((impact): impact is string => impact !== undefined)

    return priceImpacts.reduce((acc, impact) => Math.max(acc, Number(impact)), 0)
  }, [route, routeMutation.isLoading])

  const setMax = useCallback(async () => {
    const amountToDeposit = Math.max(
      assetToDeposit?.symbol === 'ETH' ? assetToDepositBalance - 0.0001 : assetToDepositBalance,
      0,
    )
    if (amountToDeposit === 0) {
      setError('amount', { message: 'Insufficient balance with 0.0001 gas buffer.' })
      return
    }
    setValue('amount', amountToDeposit, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    })
  }, [assetToDeposit?.symbol, assetToDepositBalance, setValue, setError])

  return (
    <Dialog
      open={!!assetToDeposit}
      onOpenChange={(open) => {
        if (!open) {
          reset()
          setValue('amount', 0)
          setAssetToDeposit(null)
          setRoute(undefined)
          setLoadingRoute(false)
          setRouteCache(null)
        }
      }}
    >
      <DialogTrigger className="hidden">
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent className="sm:rounded-3xl border border-[#303030] p-8">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSend)}>
          <div className="flex flex-col gap-8 pt-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center gap-2 px-1">
                <div className="text-base font-medium">Send</div>
                <div
                  className="text-sm font-medium flex items-center gap-2 text-[#5E616E] cursor-pointer hover:text-white"
                  onClick={setMax}
                  onKeyUp={(e) => e.key === 'Enter' && setMax()}
                >
                  <WalletIcon fill="#5E616E" className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {Number.isInteger(assetToDepositBalance)
                      ? assetToDepositBalance
                      : assetToDepositBalance.toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="relative flex flex-row gap-2 items-center">
                <div className="flex flex-row gap-3 items-center bg-card rounded-md p-2 px-3 w-fit absolute top-1/2 -translate-y-1/2 left-2">
                  {assetToDeposit ? (
                    <AssetLogo
                      chainId={assetToDeposit.chainId}
                      address={assetToDeposit.contractAddress}
                      symbol={assetToDeposit.symbol}
                      icon={assetToDeposit.logo}
                    />
                  ) : (
                    <div className="min-w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-base leading-[120%] font-500 text-white">
                      {assetToDeposit?.symbol}
                    </span>
                    <span className="text-xs leading-[120%] text-[#959595] tracking-[0.3px]">{`${assetToDeposit?.chainName}`}</span>
                  </div>
                </div>
                <Input
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="0"
                  className="border-[#303030] text-white text-right items-center h-18 text-[24px]"
                  type="string"
                  pattern="[0-9]*\.?[0-9]*"
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement
                    if (target.value === '0') {
                      target.value = ''
                    }
                  }}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement
                    const value = target.value.replace(/[^0-9.]/g, '')
                    e.target.value = value
                    register('amount', {
                      setValueAs: (v) => (v === '' ? 0 : parseFloat(v)),
                    }).onChange(e)
                  }}
                />
              </div>
              {errors?.amount && (
                <div className="text-sm font-medium text-red-500">
                  {errors.amount.message as string}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <div className="text-base font-medium">Receive</div>
                <div className="bg-card w-full p-5 flex flex-col gap-3 items-start justify-center rounded-2">
                  <div className="flex gap-4 items-center w-full">
                    <div className="bg-background h-13 min-w-13 flex items-center justify-center rounded-2">
                      <XionFlame />
                    </div>

                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="text-sm leading-none text-[#9B9B9B]">
                        {truncateAddress(xionAddress)}
                      </div>
                      {xionAddress && (
                        <div className="flex flex-row gap-2 text-[24px] leading-none font-bold items-center">
                          {loadingRoute ? (
                            <div className="flex items-center gap-2">
                              <Spinner className="w-4 h-4" />
                            </div>
                          ) : route?.amountOut ? (
                            (Number(route?.amountOut) / 10 ** 6).toFixed(4)
                          ) : (
                            '--'
                          )}{' '}
                          XION
                          {knownSlippage && (
                            <span className="text-sm font-medium text-[#9B9B9B]">
                              ({knownSlippage.toFixed(2)}% slippage)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {route?.warning && (
                  <div className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                    <LucideAlertTriangle className="w-4 h-4" />
                    {route.warning.message}
                  </div>
                )}
                {errors?.route && (
                  <div className="text-sm font-medium text-red-500 flex items-center gap-2">
                    <LucideAlertCircle className="w-4 h-4" />
                    {errors.route.message as string}
                  </div>
                )}
              </div>
            </div>
            {route?.estimatedFees && route.estimatedFees.length > 0 && (
              <div className="flex flex-col gap-2">
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <div
                  className="text-base font-medium flex items-center justify-between cursor-pointer hover:opacity-80"
                  onClick={() => setFeesExpanded(!feesExpanded)}
                >
                  <span>Estimated Fees</span>
                  <svg
                    role="img"
                    aria-label="Expand"
                    className={`w-4 h-4 transition-transform ${feesExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                {feesExpanded && <FeeList fees={route.estimatedFees} />}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-[52px]"
              disabled={!walletClient || loadingRoute || assetIsRouting || !isValid || isSubmitting}
            >
              {loadingRoute ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  <span>Simulating...</span>
                </div>
              ) : assetIsRouting || routeMutation.isLoading || isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  <span>Depositing...</span>
                </div>
              ) : needsSwitchChain ? (
                'Switch chain'
              ) : (
                'Deposit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
