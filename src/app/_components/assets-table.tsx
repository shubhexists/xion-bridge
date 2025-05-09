import {
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@abstract-money/ui/components'
import { cn } from '@abstract-money/ui/utils'
import { useAbstraxionAccount } from '@burnt-labs/abstraxion'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { TokenWithPrice, useTokens } from 'app/_hooks/use-tokens'
import { RefreshCw } from 'lucide-react'
import { useMemo } from 'react'
import { useDeepCompareMemo } from 'use-deep-compare'
import { useAccount } from 'wagmi'
import { AssetLogo } from '~/_components/asset-logo.tsx'
import { useRecoveryDialogStore } from '~/_components/recover/recover-dialog.tsx'
import { usePortfolioValue } from '~/_hooks/use-portfolio-value'
import { useRecoverableBalances } from '~/_hooks/use-recoverable-balances'

export default function AssetsTable({
  setAssetToDeposit,
}: {
  setAssetToDeposit: (asset: TokenWithPrice) => void
}) {
  const { address, isConnected: isEVMConnected } = useAccount()
  const { isConnected } = useAbstraxionAccount()
  const buttonLoading = false
  const { totalValue } = usePortfolioValue()

  const { data: recoverableBalances } = useRecoverableBalances()
  const showRecovery = recoverableBalances && recoverableBalances.length > 0
  const { setIsOpen: setRecoveryOpen } = useRecoveryDialogStore()

  const {
    tokens: _tokens,
    tokensWithPricesOnly,
    isLoading: loading,
    isRefetching: isTokensRefetching,
    errors: _tokensError,
    refresh,
  } = useTokens(address as `0x${string}`)

  // biome-ignore lint/correctness/useExhaustiveDependencies: checked
  const columns: ColumnDef<TokenWithPrice>[] = useMemo(
    () => [
      {
        header: 'Asset',
        accessorKey: 'symbol',
        cell: ({ row }) => {
          const icon = row.original.logo
          const symbol = row.original.symbol
          const chain = row.original.chainName

          return (
            <div className="flex items-center gap-3">
              <AssetLogo
                icon={icon}
                chainId={row.original.chainId}
                address={row.original.contractAddress}
                symbol={symbol}
              />
              <div className="flex flex-col gap-1">
                <span className="text-base leading-[120%] font-500 text-white">{symbol}</span>
                <span className="text-xs leading-[120%] text-[#959595] tracking-[0.3px]">{`${chain}`}</span>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Balance',
        accessorKey: 'balance',
        cell: ({ getValue, row }) => {
          const balance = getValue<number>() || 0
          const price = Number(row.original.price) || 1
          const value = price * Number(balance)
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-300 tracking-[0.3px] text-white">
                {Number(balance.toLocaleString()).toFixed(4)}
              </span>
              <span className="text-sm text-primary font-300 tracking-[0.3px] md:hidden">
                {`$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              </span>
            </div>
          )
        },
      },
      {
        header: () => <span className="hidden md:inline-block">Value</span>,
        accessorKey: 'price',
        cell: ({ getValue, row }) => {
          const val = getValue<string>()
          const balance = row.original.balance ?? 0
          const price = Number(val) * Number(balance)
          return (
            <td className="hidden md:table-cell">
              <span className="text-sm text-primary font-300 tracking-[0.3px]">
                {`$${price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              </span>
            </td>
          )
        },
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => {
          return (
            <div className="text-right">
              {(() => {
                const button = (
                  <button
                    type="button"
                    className={cn(
                      'px-3 py-1 text-sm text-primary bg-transparent border border-transparent rounded-md tracking-[0.3px] hover:bg-primary/20 hover:border hover:border-primary/60 transition-all duration-100',
                      { 'opacity-50 cursor-not-allowed': !isConnected || buttonLoading },
                    )}
                    onClick={() => setAssetToDeposit(row.original)}
                    disabled={!isConnected || buttonLoading}
                  >
                    Deposit
                  </button>
                )

                if (!isConnected) {
                  return (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent className="border-0 shadow-lg shadow-black border border-[#2A2B32] rounded-1 text-xs">
                          Connect Xion account
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                }

                return button
              })()}
            </div>
          )
        },
      },
    ],
    [isConnected],
  )

  const tableDataWithFallback = useDeepCompareMemo(() => {
    if (loading) {
      return [...Array(3)].map((_) => ({})) as TokenWithPrice[]
    }
    return tokensWithPricesOnly || []
  }, [tokensWithPricesOnly, loading])

  const tableColumnsWithFallback = useMemo(() => {
    if (loading) {
      return [
        {
          header: 'Asset',
          accessorKey: 'asset',
          cell: () => (
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="w-[100px] h-4" />
                <Skeleton className="w-[100px] h-2" />
              </div>
            </div>
          ),
        },
        {
          header: 'Balance',
          accessorKey: 'balance',
          cell: () => (
            <div className="flex flex-col gap-1">
              <Skeleton className="w-[100px] h-4" />
              <Skeleton className="w-[100px] h-4 md:hidden" />
            </div>
          ),
        },
        {
          header: 'Value',
          accessorKey: 'value',
          cell: () => (
            <td className="hidden md:table-cell">
              <Skeleton className="w-[100px] h-4" />
            </td>
          ),
        },
        {
          header: '',
          id: 'actions',
          cell: () => <Skeleton className="ml-auto w-10 h-4" />,
        },
      ] as ColumnDef<TokenWithPrice>[]
    }
    return columns
  }, [loading, columns])

  const table = useReactTable({
    data: tableDataWithFallback,
    columns: tableColumnsWithFallback,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full max-w-[920px] mx-auto bg-card p-[28px] pt-5 rounded-2">
      <div className="flex justify-between items-start text-white">
        <div>
          <h1 className="text-base font-400 text-[#959595]">Portfolio Value</h1>
          <div className="text-4xl text-primary mt-2 ml-6">
            {`$${totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}`}
          </div>
        </div>
        {showRecovery && (
          <Button type="button" onClick={() => setRecoveryOpen(true)} className="ml-auto mr-5">
            Recovery
          </Button>
        )}
        <button
          type={'button'}
          onClick={() => refresh.all()}
          disabled={loading || isTokensRefetching || !isEVMConnected}
          className={cn(
            'p-2 text-primary hover:bg-primary/20 rounded-full transition-all duration-100',
            (loading || isTokensRefetching) && 'animate-spin',
          )}
          title="Refresh balances"
        >
          <RefreshCw size={20} className={loading || isTokensRefetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="overflow-hidden rounded-lg mt-6">
        {!isEVMConnected ? (
          <div className="flex items-center justify-center h-24 text-[#B0B0B0] text-lg border border-[#2A2B32] rounded-md shadow-lg">
            Connect your EVM wallet to see your balances
          </div>
        ) : !loading && !tokensWithPricesOnly.length ? (
          <div className="flex items-center justify-center h-24 text-[#B0B0B0] text-lg border border-[#2A2B32] rounded-md shadow-lg">
            No tokens found. Go buy some!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[200px] border-collapse">
              <thead className="border-b border-[#2A2B32]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 text-left text-sm font-normal text-white"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#2A2B32] last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-4 py-2 text-sm',
                          cell.column.id === 'actions' && 'w-[200px] text-right',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
