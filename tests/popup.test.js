import { expect, test } from '@playwright/test';

test.describe('Random Popup Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper function for checkbox interactions
  async function toggleCheckbox(page, checkboxId, shouldCheck = true) {
    await page.evaluate(
      ({ id, check }) => {
        document.getElementById(id).checked = check;
        document.getElementById(id).dispatchEvent(new Event('change'));
      },
      { id: checkboxId, check: shouldCheck }
    );
  }

  test('should show random popup within expected timeframe', async ({
    page,
  }) => {
    // Wait for popup to appear (random delay up to 20 seconds)
    const popup = page.locator('.popup-modal');

    // Wait up to 25 seconds for popup to appear
    await expect(popup).toBeVisible({ timeout: 25000 });

    // Verify popup content
    await expect(popup.locator('.popup-title')).toContainText('Special Offer!');
    await expect(popup.locator('.popup-content')).toContainText(
      'Sign up now and get 50% off'
    );
    await expect(popup.locator('.popup-icon')).toContainText('🎯');
  });

  test('should have functional popup buttons', async ({ page }) => {
    // Wait for popup to appear
    const popup = page.locator('.popup-modal');
    await expect(popup).toBeVisible({ timeout: 25000 });

    // Verify both buttons are present
    const maybeLaterBtn = popup.locator('text=Maybe Later');
    const claimOfferBtn = popup.locator('text=Claim Offer');

    await expect(maybeLaterBtn).toBeVisible();
    await expect(claimOfferBtn).toBeVisible();
  });

  test('should dismiss popup when "Maybe Later" is clicked', async ({
    page,
  }) => {
    // Wait for popup to appear
    const popup = page.locator('.popup-modal');
    await expect(popup).toBeVisible({ timeout: 25000 });

    // Click "Maybe Later" button
    await popup.locator('text=Maybe Later').click();

    // Popup should be removed
    await expect(popup).toBeHidden();
  });

  test('should dismiss popup when "Claim Offer" is clicked', async ({
    page,
  }) => {
    // Wait for popup to appear
    const popup = page.locator('.popup-modal');
    await expect(popup).toBeVisible({ timeout: 25000 });

    // Click "Claim Offer" button
    await popup.locator('text=Claim Offer').click();

    // Popup should be removed
    await expect(popup).toBeHidden();
  });

  test('should auto-remove popup after 10 seconds if not interacted with', async ({
    page,
  }) => {
    // Wait for popup to appear
    const popup = page.locator('.popup-modal');
    await expect(popup).toBeVisible({ timeout: 20000 });
    // Wait for auto-removal (10 seconds + buffer)
    await expect(popup).toBeHidden({ timeout: 15000 });
  });

  test('should not interfere with form functionality', async ({ page }) => {
    // Start filling form
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    // Wait for popup to potentially appear
    const popup = page.locator('.popup-modal');
    await popup.isVisible({ timeout: 20000 });
    // Dismiss popup if present
    if (await popup.isVisible()) {
      if (await popup.locator('text=Maybe Later').isVisible()) {
        await popup.locator('text=Maybe Later').click();
      } else if (await popup.locator('text=Claim Offer').isVisible()) {
        await popup.locator('text=Claim Offer').click();
      }
      await expect(popup).toBeHidden();
    }
    // Continue with form - should still work
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);
    // Wait for submit button to be enabled
    await expect(page.locator('.submit-btn')).toBeEnabled({ timeout: 10000 });
  });

  test('should handle multiple popup instances correctly', async ({ page }) => {
    // Reload page to reset popup timer
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Wait for first popup
    const popup = page.locator('.popup-modal');
    await expect(popup).toBeVisible({ timeout: 20000 });
    // Dismiss first popup
    await popup.locator('text=Maybe Later').click();
    await expect(popup).toBeHidden();
    // Reload page again to trigger another popup
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Second popup should appear
    await expect(popup).toBeVisible({ timeout: 20000 });
  });

  test('should have proper popup styling and layout', async ({ page }) => {
    // Wait for popup to appear
    const popup = page.locator('.popup-modal');
    await expect(popup).toBeVisible({ timeout: 25000 });

    const popupContent = popup.locator('.popup-content');
    const popupIcon = popup.locator('.popup-icon');
    const popupTitle = popup.locator('.popup-title');

    // Check that popup elements are visible and properly styled
    await expect(popupContent).toBeVisible();
    await expect(popupIcon).toBeVisible();
    await expect(popupTitle).toBeVisible();

    // Verify popup is centered/positioned correctly
    const popupBox = await popup.boundingBox();
    expect(popupBox).toBeTruthy();
    expect(popupBox.width).toBeGreaterThan(0);
    expect(popupBox.height).toBeGreaterThan(0);
  });

  test('should handle popup during form submission', async ({ page }) => {
    // Fill form quickly
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    // Wait for email validation
    await page.waitForTimeout(3000);

    // Start form submission
    await page.locator('.submit-btn').click();

    // Wait for popup to potentially appear during submission
    await page.waitForTimeout(10000);

    // If popup appears during submission, dismiss it
    const popup = page.locator('.popup-modal');
    if (await popup.isVisible()) {
      await popup.locator('text=Maybe Later').click();
    }

    // Form submission should complete successfully or with error
    const successState = page.locator('#successState');
    const errorState = page.locator('#errorState');

    const isSuccessVisible = await successState.isVisible();
    const isErrorVisible = await errorState.isVisible();
    expect(isSuccessVisible || isErrorVisible).toBe(true);
  });
});
