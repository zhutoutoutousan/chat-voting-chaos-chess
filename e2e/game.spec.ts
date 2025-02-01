import { test, expect } from '@playwright/test'

test('game flow', async ({ page }) => {
  await page.goto('/')
  
  // Click play button
  await page.click('text=Play Now')
  
  // Check if game board is visible
  await expect(page.locator('[data-testid="chess-board"]')).toBeVisible()
  
  // Make a move
  await page.dragAndDrop('[data-testid="piece-e2"]', '[data-testid="square-e4"]')
  
  // Verify move
  await expect(page.locator('[data-testid="piece-e2"]')).toHaveAttribute('data-square', 'e4')
}) 