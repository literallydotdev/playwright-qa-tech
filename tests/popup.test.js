import path from 'node:path';
import { test, expect } from '@playwright/test';

test('should handle and close popup if it appears', async ({ page }) => {
  await page.goto(`file://${path.join(__dirname, '..', 'index.html')}`);

  // Wait for popup (max 7 sec because popup is random in that window)
  const popup = page.locator('.popup-modal');
  await popup.waitFor({ timeout: 8000 });

  await page.click('.popup-modal .close-btn');
  await expect(popup).toHaveCount(0);
});
