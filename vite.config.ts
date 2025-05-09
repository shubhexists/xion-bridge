import { ValidateEnv } from '@julr/vite-plugin-validate-env'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import React from '@vitejs/plugin-react'
import isCI from 'is-ci'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// import dts from 'vite-plugin-dts'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'ABSTRACT',
  optimizeDeps: {
    exclude: ['pkg-types'],
  },

  server: {
    port: 4200,
  },

  build: {
    sourcemap: !isCI,

    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'SOURCEMAP_ERROR') {
          return
        }

        defaultHandler(warning)
      },

      // Prettify the chunk paths & drop hash in asset names
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: ({ name }) => `${name.replace(/(\.\.\/|src\/)/g, '')}.js`,
        assetFileNames: ({ name = '[hash]' }) => `${name.replace(/(\.\.\/|src\/)/g, '')}`,
      },
    },
  },

  plugins: [
    nodePolyfills({
      include: ['util', 'stream', 'crypto', 'http', 'vm', 'https'],
      globals: {
        Buffer: true,
        process: true,
        global: true,
      },
    }),
    // TODO: it's unclear how to generate type definitions in non-library build mode
    // dts({ rollupTypes: true }),

    // Only validate the env when not in a CI environment
    ...(isCI ? [] : [ValidateEnv()]),
    tsconfigPaths(),
    // If you are using @vitejs/plugin-react with @unocss/preset-attributify, you must add the plugin before @vitejs/plugin-react.
    UnoCSS(),
    React(),
    svgr(),

    TanStackRouterVite({
      routesDirectory: 'src/app',
      generatedRouteTree: 'src/routes.gen.ts',
      routeFileIgnorePrefix: '_',
    }),

    visualizer({ open: true, filename: 'bundle-visualization.html' }),
  ],
})
