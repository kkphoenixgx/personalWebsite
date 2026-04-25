/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4205',
    trace: 'on-first-retry',
  },
  projects: [
    { 
      name: 'chromium', 
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-unsafe-swiftshader']
        }
      } 
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ],
  webServer: {
    command: 'npx --yes http-server dist/personal-website/browser -p 4205',
    url: 'http://localhost:4205',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
});