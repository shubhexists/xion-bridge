import { presetAbstract, transformersAbstract } from '@abstract-money/ui/uno.preset'
import { defineConfig } from 'unocss'

export const presets = [
  presetAbstract({
    webFonts: {
      provider: 'google',
      fonts: {
        'dm-sans': { name: 'DM Sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
        sans: { name: 'Inter', weights: [400, 500, 600, 700, 800, 900] },
      },
    },
  }),
]

export default defineConfig({
  presets,
  transformers: [...transformersAbstract()],
})
