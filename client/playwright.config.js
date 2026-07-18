import { defineConfig, devices } from '@playwright/test'

const localChrome = process.env.CI ? {} : { channel: 'chrome' }

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], ...localChrome } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], ...localChrome } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    env: { VITE_API_URL: 'http://localhost:5001/api', VITE_SOCKET_URL: 'http://localhost:5001' },
  },
})
