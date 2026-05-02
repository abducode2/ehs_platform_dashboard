
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/ehs_platform_dashboard/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            // مثال: تجميع مكتبات UI شائعة في chunk منفصل
            if (id.includes('lodash')) {
              return 'lodash';
            }
            // افتراضي: اسم الحزمة كـ chunk منفصل بناءً على المسار
            const parts = id.split('node_modules/')[1];
            if (parts) {
              const pkgName = parts.split('/')[0];
              return `vendor-${pkgName}`;
            }
          }
        }
      }
    }
  }
});
