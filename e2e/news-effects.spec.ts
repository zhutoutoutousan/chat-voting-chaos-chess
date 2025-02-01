import { test, expect } from '@playwright/test'

test('news effects trigger visual changes', async ({ page }) => {
  await page.goto('/play')
  
  // Wait for news drawer
  await expect(page.locator('[data-testid="news-drawer"]')).toBeVisible()
  
  // Click news item
  await page.click('[data-testid="news-item-0"]')
  
  // Verify visual effect
  await expect(page.locator('[data-testid="chaos-effect"]')).toBeVisible()
}) 