import { grazProvider } from '@abstract-money/provider-graz'
import { AbstractProvider, createConfig as createReactConfig } from '@abstract-money/react'
import { TooltipProvider } from '@abstract-money/ui/components'
import '@rainbow-me/rainbowkit/styles.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import '@unocss/reset/tailwind.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { routeTree } from 'routes.gen.ts'
import { GrazProvider } from './app/_providers/graz.tsx'
import { ABSTRACT_SUBGRAPH_URL } from './constants.ts'
import { config } from './wagmi-config.ts'
import 'virtual:uno.css'

import { RainbowKitProvider, midnightTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

export const abstractConfig = createReactConfig({
  apiUrl: ABSTRACT_SUBGRAPH_URL,
  provider: grazProvider,
})

const queryClient = new QueryClient()

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={midnightTheme()}>
          <TooltipProvider delayDuration={100} skipDelayDuration={200}>
            <GrazProvider>
              <AbstractProvider config={abstractConfig}>
                <RouterProvider router={createRouter({ routeTree: routeTree })} />
              </AbstractProvider>
            </GrazProvider>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
