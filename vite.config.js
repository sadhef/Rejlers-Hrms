import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  const allowedHostsList = ['syncme.biztras.com'];

  return {
    base: '/rejlershrms/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    esbuild: isProduction
      ? {
          drop: ['console', 'debugger'],
        }
      : undefined,
    server: {
      host: true,
      port: parseInt(env.FRONTEND_PORT, 10) || 5173,
      allowedHosts: allowedHostsList,
      proxy: env.VITE_API_URL ? {
        '/bt_hrms_mobile_access': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
    preview: {
      host: true,
      port: parseInt(env.FRONTEND_PORT, 10) || 5173,
      allowedHosts: allowedHostsList,
    },
  };
});
