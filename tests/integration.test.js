import { expect, test } from '@playwright/test';

test.describe('Integration Tests - All Components Working Together', () => {
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

  test('should handle complex user journey with all components', async ({
    page,
  }) => {
    // Test complete user journey: Maps -> Form -> Popup interaction

    // 1. Verify Maps loads properly
    const iframe = page.locator('iframe.test-iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /Space\+Needle,Seattle\+WA/);

    // 2. Start filling form while maps is present
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');

    // 3. Verify password strength updates in real-time
    await page.fill('#password', 'weak');
    await expect(page.locator('.strength-bar')).toHaveClass(/weak/);

    await page.fill('#password', 'StrongPass123!');
    await expect(page.locator('.strength-bar')).toHaveClass(/strong/);

    // 4. Complete form validation
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    // 5. Wait for email availability check
    await page.waitForTimeout(3000);

    // 6. Handle popup if it appears during form interaction
    const popup = page.locator('.popup-modal');

    // Wait a bit to see if popup appears
    await page.waitForTimeout(10000);

    if (await popup.isVisible()) {
      // Verify popup doesn't break form state
      await expect(page.locator('.submit-btn')).toBeEnabled();

      // Dismiss popup
      await popup.locator('text=Maybe Later').click();
      await expect(popup).toBeHidden();
    }

    // 7. Verify form is still functional after popup interaction
    await expect(page.locator('.submit-btn')).toBeEnabled();
    await expect(iframe).toBeVisible(); // Maps still works

    // 8. Submit form
    await page.locator('.submit-btn').click();

    // 9. Verify submission process
    await expect(page.locator('.btn-text')).toContainText(
      'Creating Account...'
    );
    await expect(page.locator('.loading-spinner')).toBeVisible();

    // 10. Wait for final result
    await page.waitForTimeout(5000);

    const successState = page.locator('#successState');
    const errorState = page.locator('#errorState');

    // Should show either success or error
    const isSuccessVisible = await successState.isVisible();
    const isErrorVisible = await errorState.isVisible();
    expect(isSuccessVisible || isErrorVisible).toBe(true);

    // 11. Verify all components are still accessible
    await expect(iframe).toBeVisible(); // Maps still loaded

    if (await successState.isVisible()) {
      await expect(successState).toContainText('Account Created Successfully!');
    } else if (await errorState.isVisible()) {
      await expect(errorState).toContainText('Oops! Something went wrong');
      // Dismiss popup if present before retry
      const popup = page.locator('.popup-modal');
      if (await popup.isVisible()) {
        if (await popup.locator('text=Maybe Later').isVisible()) {
          await popup.locator('text=Maybe Later').click();
        } else if (await popup.locator('text=Claim Offer').isVisible()) {
          await popup.locator('text=Claim Offer').click();
        }
        await expect(popup).toBeHidden();
      }
      // Test retry functionality
      await page.locator('.retry-btn').click();
      await expect(page.locator('#signupForm')).toBeVisible();
    }
  });

  test('should handle popup appearing during form submission', async ({
    page,
  }) => {
    // Fill form quickly
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    // Wait for validations
    await page.waitForTimeout(3000);

    // Start form submission
    await page.locator('.submit-btn').click();

    // Wait for potential popup during submission
    await page.waitForTimeout(15000);

    const popup = page.locator('.popup-modal');
    const successState = page.locator('#successState');
    const errorState = page.locator('#errorState');

    // If popup appears during submission, handle it
    if (await popup.isVisible()) {
      await popup.locator('text=Claim Offer').click();
      await expect(popup).toBeHidden();
    }

    // Form should still complete
    const isSuccessVisible = await successState.isVisible();
    const isErrorVisible = await errorState.isVisible();
    expect(isSuccessVisible || isErrorVisible).toBe(true);
  });

  test('should handle all validation errors simultaneously', async ({
    page,
  }) => {
    // Touch all fields to trigger validation
    await page.click('#fullName');
    await page.locator('#fullName').blur();

    await page.click('#email');
    await page.locator('#email').blur();

    await page.click('#password');
    await page.locator('#password').blur();

    await page.click('#confirmPassword');
    await page.locator('#confirmPassword').blur();

    await toggleCheckbox(page, 'agreeTerms', true);
    await toggleCheckbox(page, 'agreeTerms', false);

    // All validation errors should appear
    await expect(
      page.locator('#fullName').locator('..').locator('.error-message')
    ).toContainText('Full name is required');
    await expect(
      page.locator('#email').locator('..').locator('.error-message')
    ).toContainText('Email address is required');
    await expect(
      page.locator('#password').locator('..').locator('.error-message')
    ).toContainText('Password is required');
    await expect(
      page.locator('#confirmPassword').locator('..').locator('.error-message')
    ).toContainText('Please confirm your password');

    // Check terms error message - it might not appear immediately
    await page.waitForTimeout(1000);
    const termsError = page
      .locator('#agreeTerms')
      .locator('..')
      .locator('.error-message');
    if (await termsError.isVisible()) {
      await expect(termsError).toContainText(
        'You must accept the terms and conditions'
      );
    }

    // Verify that validation errors are visible
    const errorCount = await page
      .locator('.error-message')
      .filter({ hasText: /required|invalid|match/ })
      .count();
    expect(errorCount).toBeGreaterThan(0);

    // Maps should still be functional
    await expect(page.locator('iframe.test-iframe')).toBeVisible();
  });

  test('should maintain functionality across page reloads', async ({
    page,
  }) => {
    // Initial state
    await expect(page.locator('iframe.test-iframe')).toBeVisible();
    await expect(page.locator('#signupForm')).toBeVisible();

    // Fill some form data
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Everything should be reset and functional
    await expect(page.locator('iframe.test-iframe')).toBeVisible();
    await expect(page.locator('#signupForm')).toBeVisible();
    await expect(page.locator('#fullName')).toHaveValue('');
    await expect(page.locator('#email')).toHaveValue('');
    await expect(page.locator('.submit-btn')).toBeDisabled();

    // Should be able to fill form again
    await page.fill('#fullName', 'Jane Doe');
    await expect(page.locator('#fullName')).toHaveValue('Jane Doe');
  });

  test('should handle mobile viewport interactions', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // All components should be responsive
    await expect(page.locator('iframe.test-iframe')).toBeVisible();
    await expect(page.locator('#signupForm')).toBeVisible();

    // Form should work on mobile
    await page.fill('#fullName', 'Mobile User');
    await page.fill('#email', 'mobile@example.com');
    await page.fill('#password', 'MobilePass123!');
    await page.fill('#confirmPassword', 'MobilePass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    // Wait for validation
    await page.waitForTimeout(3000);

    // Submit should work on mobile
    await expect(page.locator('.submit-btn')).toBeEnabled();

    // Maps should maintain proper dimensions
    const iframe = page.locator('iframe.test-iframe');
    const boundingBox = await iframe.boundingBox();
    expect(boundingBox.width).toBeGreaterThan(300);
    expect(boundingBox.height).toBe(450);
  });

  test('should demonstrate the testing challenges mentioned in article', async ({
    page,
  }) => {
    // This test showcases the exact scenarios mentioned in the article

    // 1. Dynamic form validation with unpredictable timing
    await page.fill('#email', 'test@example.com');
    await page.locator('#email').blur();

    // Email validation has random delay (500ms - 2.5s)
    await expect(page.locator('.validation-status')).toContainText(
      'Checking availability...'
    );

    // 2. Password strength indicator updates
    await page.fill('#password', 'weak'); // Should show weak
    await expect(page.locator('.strength-text')).toContainText('Weak password');

    await page.fill('#password', 'StrongPass123!'); // Should show strong
    await expect(page.locator('.strength-text')).toContainText(
      'Strong password'
    );

    // 3. Unpredictable submission states (30% failure rate)
    await page.fill('#fullName', 'Test User');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    await page.waitForTimeout(3000); // Wait for email validation

    // 4. Random popup behavior (appears within 20 seconds)
    // Combined with form submission
    await page.locator('.submit-btn').click();

    // Wait for both submission and potential popup
    await page.waitForTimeout(10000);

    // Handle popup if it appears
    const popup = page.locator('.popup-modal');
    if (await popup.isVisible()) {
      await popup.locator('text=Maybe Later').click();
    }

    // 5. Embedded third-party iframe (Google Maps)
    await expect(page.locator('iframe.test-iframe')).toBeVisible();

    // These are the exact scenarios that make testing challenging
    // and demonstrate why AI-driven testing might be beneficial
  });
});
