import { Schema, defineConfig } from '@julr/vite-plugin-validate-env'

export default defineConfig({
  ABSTRACT_SUBGRAPH_URL: Schema.string(),
  ABSTRACT_DEFAULT_CHAIN_NAME: Schema.string(),
  ABSTRACT_WALLET_CONNECT_PROJECT_ID: Schema.string.optional(),
  ABSTRACT_PORT: Schema.number.optional(),
  ABSTRACT_DEBUG: Schema.boolean.optional(),
  ABSTRACT_ALCHEMY_API_KEY: Schema.string(),
  ABSTRACT_SKIP_API_KEY: Schema.string(),
  ABSTRACT_ALCHEMY_PROXY_URL: Schema.string(),
})
