import { defineConfig } from '@abstract-money/cli'
import { react, registry } from '@abstract-money/cli/plugins'

export default defineConfig({
  out: 'src/generated',
  plugins: [
    react(),
    registry({
      contracts: [
        {
          name: 'dex',
          namespace: 'abstract',
          version: '0.23.0',
        },
      ],
    }),
  ],
})
