import { test } from '@playwright/test';

test.skip('should find and click zoom in button on Google Maps iframe', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/');

  const mapFrame = page.frameLocator('iframe[src*="google.com/maps"]');
  await mapFrame
    .locator('button[aria-label="Zoom in"]')
    .click({ timeout: 50000 });
});
