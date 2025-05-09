import { Toaster, TooltipProvider } from '@abstract-money/ui/components'
import { AbstraxionProvider } from '@burnt-labs/abstraxion'
import '@burnt-labs/abstraxion/dist/index.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import '@unocss/reset/tailwind.css'
import { AbtsraxionModalCloser } from '~/_components/abstraxion.tsx'
import { Footer } from '~/_components/footer'
import { Header } from '~/_components/header.tsx'
import { Styles } from '../styles'
import './globals.css'

export const Route = createRootRoute({
  component: RootLayout,
})

export function RootLayout() {
  return (
    <AbstraxionProvider
      config={{
        rpcUrl: 'https://rpc.xion-mainnet-1.burnt.com:443',
        restUrl: 'https://api.xion-mainnet-1.burnt.com:443',
        // callbackUrl: window.location.origin,
        treasury: 'xion13mvkng4fuqlw4vgv8wpsxg53pp627cnd5l07haw4mphgjm5dc6ws43kuge',
      }}
    >
      <div className="h-screen">
        <Styles />

        <TooltipProvider delayDuration={100} skipDelayDuration={200}>
          <div className="dark" un-h="full" un-flex="~" un-text="foreground">
            <main un-w="full" un-h="full">
              <div className="h-full w-full relative px-4 md:px-6 flex flex-col gap-4 lg:gap-12">
                <Header />
                <Outlet />
                <Toaster />
                <div className="mt-auto">
                  <Footer />
                </div>
                <AbtsraxionModalCloser />
              </div>
            </main>
          </div>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition={'bottom-right'} />
      </div>
    </AbstraxionProvider>
  )
}
