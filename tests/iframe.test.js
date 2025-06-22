import path from 'node:path';
import { test } from '@playwright/test';

test('should interact with nested iframe button', async ({ page }) => {
  await page.goto(`file://${path.join(__dirname, '..', 'index.html')}`);

  const frame = page.frameLocator('iframe[src="iframe-page.html"]');

  await frame.locator('button.submit').click();
});
