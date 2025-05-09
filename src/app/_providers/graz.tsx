import { useToaster } from '@abstract-money/ui/components'
import { QueryClient } from '@tanstack/react-query'
import { GrazProvider as Graz_GrazProvider } from 'graz'
import { noble, osmosis, xion } from 'graz/chains'
import { PropsWithChildren, useMemo } from 'react'
import { ACCEPTABLE_QUERY_ERRORS } from '~/_lib/errors.ts'

export function GrazProvider({ children }: PropsWithChildren) {
  const { toast } = useToaster()

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // useErrorBoundary: true,
            staleTime: 300000, // 300 seconds
            // cacheTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            onError: (e) => {
              console.error(e)
              if (
                e instanceof Error &&
                ACCEPTABLE_QUERY_ERRORS.some((msg) => e.message.includes(msg))
              ) {
                return
              }

              toast({
                variant: 'destructive',
                title: 'Error',
                description: e instanceof Error ? e.message : 'Unknown error',
              })
            },
          },
          mutations: {
            onError: (e) => {
              console.error(e, e instanceof Error ? e.message : 'Unknown error')
              if (e instanceof Error && e.message.includes('rejected')) {
                toast({
                  title: 'Info',
                  description: 'Request rejected',
                })
                return
              }

              console.log('mutaitons', e)

              if (e instanceof Error && e.message.includes('fee-grant not found: not found')) {
                toast({
                  title: 'Info',
                  description: 'Fee grant not found. Please reauthenticate your XION account.',
                  // action: (
                  //   <ToastAction onClick={() => window.open('https://docs.osmosis.zone/guides/fees/fee-grant', '_blank')} />
                })
                return
              }

              toast({
                variant: 'destructive',
                title: 'Error',
                description: e instanceof Error ? e.message : 'Unknown error',
              })
            },
          },
        },
      }),
    [toast],
  )

  return (
    <Graz_GrazProvider
      client={queryClient}
      grazOptions={{
        chains: [xion, osmosis, noble],
      }}
    >
      {children}
    </Graz_GrazProvider>
  )
}
