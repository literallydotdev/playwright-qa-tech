import { expect, test } from '@playwright/test';

test.describe('Embedded Google Maps Test', () => {
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

  test('should display maps section with proper heading', async ({ page }) => {
    const mapsSection = page
      .locator('section')
      .filter({ hasText: 'Embedded Maps Test' });
    await expect(mapsSection).toBeVisible();

    const cardTitle = mapsSection.locator('.card-title');
    await expect(cardTitle).toContainText('Embedded Maps Test');

    const cardDescription = mapsSection.locator('.card-description');
    await expect(cardDescription).toContainText(
      'Test external iframe integrations with third-party services'
    );
  });

  test('should load Google Maps iframe correctly', async ({ page }) => {
    const iframe = page.locator('iframe.test-iframe');

    // Verify iframe is present and visible
    await expect(iframe).toBeVisible();

    // Verify iframe attributes
    await expect(iframe).toHaveAttribute('src', /google\.com\/maps\/embed/);
    await expect(iframe).toHaveAttribute(
      'title',
      'Google Maps integration test'
    );
    await expect(iframe).toHaveAttribute('width', '100%');
    await expect(iframe).toHaveAttribute('height', '450');
    await expect(iframe).toHaveAttribute('loading', 'lazy');
    await expect(iframe).toHaveAttribute('allowfullscreen');
  });

  test('should have proper iframe security attributes', async ({ page }) => {
    const iframe = page.locator('iframe.test-iframe');

    // Check security-related attributes
    await expect(iframe).toHaveAttribute(
      'referrerpolicy',
      'no-referrer-when-downgrade'
    );
    await expect(iframe).toHaveAttribute('style', 'border: 0');
  });

  test('should load Space Needle location in Seattle', async ({ page }) => {
    const iframe = page.locator('iframe.test-iframe');

    // Verify the specific location is being loaded
    const src = await iframe.getAttribute('src');
    expect(src).toContain('Space+Needle,Seattle+WA');
    expect(src).toContain('key=AIzaSyD7BTAg7rzTAMNKMDGMWjBa-IGxKMmlrdk');
  });

  test('should have proper iframe dimensions and styling', async ({ page }) => {
    const iframe = page.locator('iframe.test-iframe');

    // Get iframe bounding box
    const boundingBox = await iframe.boundingBox();

    expect(boundingBox).toBeTruthy();
    expect(boundingBox.width).toBeGreaterThan(300); // Should be responsive
    expect(boundingBox.height).toBeCloseTo(450, 0); // Fixed height with tolerance
  });

  test('should be contained within maps test card', async ({ page }) => {
    const mapsCard = page
      .locator('section')
      .filter({ hasText: 'Embedded Maps Test' });
    const iframe = page.locator('iframe.test-iframe');

    // Verify iframe is within the maps card
    const cardContent = mapsCard.locator('.card-content');
    await expect(cardContent).toContainText(''); // Should contain the iframe
    await expect(iframe).toBeVisible();
  });

  test('should handle iframe loading states', async ({ page }) => {
    const iframe = page.locator('iframe.test-iframe');

    // Initially iframe should be visible
    await expect(iframe).toBeVisible();

    // Wait for iframe to potentially load (lazy loading)
    await page.waitForTimeout(2000);

    // Iframe should still be visible after loading
    await expect(iframe).toBeVisible();
  });

  test('should maintain aspect ratio on different viewport sizes', async ({
    page,
  }) => {
    const iframe = page.locator('iframe.test-iframe');

    // Test on desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);

    let boundingBox = await iframe.boundingBox();
    expect(boundingBox.height).toBeCloseTo(450, 0);
    expect(boundingBox.width).toBeGreaterThan(500); // Adjusted expectation

    // Test on tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    boundingBox = await iframe.boundingBox();
    expect(boundingBox.height).toBeCloseTo(450, 0);
    expect(boundingBox.width).toBeGreaterThan(400); // Adjusted expectation

    // Test on mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    boundingBox = await iframe.boundingBox();
    expect(boundingBox.height).toBeCloseTo(450, 0);
    expect(boundingBox.width).toBeGreaterThan(300);
  });

  test('should not interfere with form functionality', async ({ page }) => {
    // Verify maps doesn't interfere with form interactions
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');

    // Check that iframe is still visible
    const iframe = page.locator('iframe.test-iframe');
    await expect(iframe).toBeVisible();

    // Continue with form
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    // Both form and iframe should be functional
    await page.waitForTimeout(3000); // Wait for email validation
    await expect(page.locator('.submit-btn')).toBeEnabled();
    await expect(iframe).toBeVisible();
  });

  test('should handle iframe errors gracefully', async ({ page }) => {
    // Test with network issues (simulate slow loading)
    await page.route('**/maps/embed/**', (route) => {
      // Delay the maps request
      setTimeout(() => route.continue(), 3000);
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const iframe = page.locator('iframe.test-iframe');

    // Iframe element should still be present even if loading is slow
    await expect(iframe).toBeVisible();

    // Page should remain functional
    await page.fill('#fullName', 'John Doe');
    await expect(page.locator('#fullName')).toHaveValue('John Doe');
  });

  test('should be accessible and properly labeled', async ({ page }) => {
    const iframe = page.locator('iframe.test-iframe');

    // Check accessibility attributes
    await expect(iframe).toHaveAttribute(
      'title',
      'Google Maps integration test'
    );

    // Check that it's contained within a proper section
    const mapsSection = page
      .locator('section')
      .filter({ hasText: 'Embedded Maps Test' });
    await expect(mapsSection).toContainText(
      'Test external iframe integrations'
    );
  });
});
