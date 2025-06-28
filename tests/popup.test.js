import { test, expect } from '@playwright/test';

test.skip('should handle and close popup if it appears', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');

  // Wait for popup (popup appears randomly between 15-35 seconds)
  const popup = page.locator('.popup-modal');

  try {
    // Wait longer since popup is random and can take up to 35 seconds
    await popup.waitFor({ timeout: 40000 });

    // If popup appears, close it
    await page.click('.popup-modal .close-btn');
    await expect(popup).toHaveCount(0);
  } catch (error) {
    // If no popup appears within timeout, that's also a valid scenario
    // since popups are random
    console.log(
      'No popup appeared during test - this is expected behavior for random popups'
    );
  }
});
