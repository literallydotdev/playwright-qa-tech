import path from 'node:path';
import { test } from '@playwright/test';

test('should find and click zoom in button on Google Maps iframe', async ({
  page,
}) => {
  await page.goto(`file://${path.join(__dirname, '..', 'index.html')}`);

  const mapFrame = page.frameLocator('iframe[src*="google.com/maps"]');
  await mapFrame.locator('button[aria-label="Zoom in"]').click();
  // Since it's an embed, no assertion — mainly to test selector doesn't fail
});
