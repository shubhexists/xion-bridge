import { createRouter } from '@tanstack/react-router'
import { routeTree } from './app'

declare global {
  type ImportMetaEnvAugmented =
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    import('@julr/vite-plugin-validate-env').ImportMetaEnvAugmented<
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      typeof import('../env').default
    >

  interface ImportMetaEnv extends ImportMetaEnvAugmented {
    // Now import.meta.env is totally type-safe and based on your `env.ts` schema definition
    // You can also add custom variables that are not defined in your schema
  }
}

const appletRouter = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof appletRouter
  }
}
