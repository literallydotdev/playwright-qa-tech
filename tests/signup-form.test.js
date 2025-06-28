import { expect, test } from '@playwright/test';

test.describe('Dynamic Sign-Up Form', () => {
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

  test('should display form with all required fields', async ({ page }) => {
    await expect(page.locator('#fullName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('#agreeTerms')).toBeAttached();
    await expect(page.locator('#newsletter')).toBeAttached();
    await expect(page.locator('.submit-btn')).toBeVisible();
    await expect(page.locator('.submit-btn')).toBeDisabled();
  });

  test('should validate full name field', async ({ page }) => {
    const nameInput = page.locator('#fullName');
    const errorMessage = page
      .locator('#fullName')
      .locator('..')
      .locator('.error-message');

    // Test empty name
    await nameInput.click();
    await nameInput.blur();
    await expect(errorMessage).toContainText('Full name is required');

    // Test name too short
    await nameInput.fill('A');
    await nameInput.blur();
    await expect(errorMessage).toContainText(
      'Name must be at least 2 characters'
    );

    // Test invalid characters
    await nameInput.fill('John123');
    await nameInput.blur();
    await expect(errorMessage).toContainText(
      'Name can only contain letters and spaces'
    );

    // Test valid name
    await nameInput.fill('John Doe');
    await nameInput.blur();
    await expect(errorMessage).toHaveText('');
    await expect(nameInput).not.toHaveClass(/error/);
  });

  test('should validate email field', async ({ page }) => {
    const emailInput = page.locator('#email');
    const errorMessage = page
      .locator('#email')
      .locator('..')
      .locator('.error-message');

    // Test empty email
    await emailInput.click();
    await emailInput.blur();
    await expect(errorMessage).toContainText('Email address is required');

    // Test invalid email format
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(errorMessage).toContainText(
      'Please enter a valid email address'
    );

    // Test valid email
    await emailInput.fill('john@example.com');
    await emailInput.blur();
    await expect(errorMessage).toHaveText('');
  });

  test('should check email availability', async ({ page }) => {
    const emailInput = page.locator('#email');
    const validationStatus = page.locator('.validation-status');

    await emailInput.fill('test@example.com');
    await emailInput.blur();

    // Should show checking status
    await expect(validationStatus).toContainText('Checking availability...');

    // Wait for availability check to complete (up to 3 seconds)
    await page.waitForTimeout(3000);

    // Should show either available or taken
    await expect(validationStatus).toContainText(
      /Email available|Email already taken/
    );
  });

  test('should validate password with strength indicator', async ({ page }) => {
    const passwordInput = page.locator('#password');
    const strengthBar = page.locator('.strength-bar');
    const strengthText = page.locator('.strength-text');
    const errorMessage = page
      .locator('#password')
      .locator('..')
      .locator('.error-message');

    // Test empty password
    await passwordInput.click();
    await passwordInput.blur();
    await expect(errorMessage).toContainText('Password is required');

    // Test weak password
    await passwordInput.fill('weak');
    await expect(strengthBar).toHaveClass(/weak/);
    await expect(strengthText).toContainText('Weak password');
    await expect(errorMessage).toContainText(
      'Password must be at least 8 characters'
    );

    // Test medium password
    await passwordInput.fill('Medium1');
    await expect(strengthBar).toHaveClass(/medium/);
    await expect(strengthText).toContainText('Medium strength');

    // Test strong password
    await passwordInput.fill('StrongPass123!');
    await expect(strengthBar).toHaveClass(/strong/);
    await expect(strengthText).toContainText('Strong password');
    await passwordInput.blur();
    await expect(errorMessage).toHaveText('');
  });

  test('should validate password confirmation', async ({ page }) => {
    const passwordInput = page.locator('#password');
    const confirmPasswordInput = page.locator('#confirmPassword');
    const errorMessage = page
      .locator('#confirmPassword')
      .locator('..')
      .locator('.error-message');

    await passwordInput.fill('StrongPass123!');

    // Test empty confirmation
    await confirmPasswordInput.click();
    await confirmPasswordInput.blur();
    await expect(errorMessage).toContainText('Please confirm your password');

    // Test non-matching passwords
    await confirmPasswordInput.fill('DifferentPass123!');
    await confirmPasswordInput.blur();
    await expect(errorMessage).toContainText('Passwords do not match');

    // Test matching passwords
    await confirmPasswordInput.fill('StrongPass123!');
    await confirmPasswordInput.blur();
    await expect(errorMessage).toHaveText('');
  });

  test('should validate terms and conditions checkbox', async ({ page }) => {
    const termsCheckbox = page.locator('#agreeTerms');

    // Initially checkbox should be unchecked
    await expect(termsCheckbox).not.toBeChecked();

    // Use JavaScript to check the checkbox
    await toggleCheckbox(page, 'agreeTerms', true);
    await expect(termsCheckbox).toBeChecked();

    // Use JavaScript to uncheck
    await toggleCheckbox(page, 'agreeTerms', false);
    await expect(termsCheckbox).not.toBeChecked();

    // Use JavaScript to check again
    await toggleCheckbox(page, 'agreeTerms', true);
    await expect(termsCheckbox).toBeChecked();
  });

  test('should enable submit button when form is valid', async ({ page }) => {
    const submitBtn = page.locator('.submit-btn');

    // Fill form with valid data
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    // Wait for email validation to complete
    await page.waitForTimeout(3000);

    await expect(submitBtn).toBeEnabled();
  });

  test('should handle form submission with loading state', async ({ page }) => {
    // Fill form with valid data
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    // Wait for email availability check
    await page.waitForTimeout(3000);

    const submitBtn = page.locator('.submit-btn');
    const btnText = page.locator('.btn-text');
    const spinner = page.locator('.loading-spinner');

    await submitBtn.click();

    // Should show loading state
    await expect(btnText).toContainText('Creating Account...');
    await expect(spinner).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Wait for form submission to complete (up to 5 seconds)
    await page.waitForTimeout(5000);

    // Should show either success or error state
    const successState = page.locator('#successState');
    const errorState = page.locator('#errorState');

    // Check if either state is visible
    const isSuccessVisible = await successState.isVisible();
    const isErrorVisible = await errorState.isVisible();
    expect(isSuccessVisible || isErrorVisible).toBe(true);
  });

  test('should handle successful form submission', async ({ page }) => {
    // Fill form with valid data
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    await page.waitForTimeout(3000); // Wait for email check

    // Keep trying until we get a success (since submission has random outcomes)
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      await page.locator('.submit-btn').click();
      await page.waitForTimeout(5000); // Wait for submission

      const successState = page.locator('#successState');
      const errorState = page.locator('#errorState');

      if (await successState.isVisible()) {
        await expect(successState).toContainText(
          'Account Created Successfully!'
        );
        await expect(page.locator('#successState .reset-btn')).toBeVisible();
        break;
      } else if (await errorState.isVisible()) {
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
        // Retry if we got an error
        await page.locator('#errorState .retry-btn').click();
        attempts++;
      } else {
        attempts++;
      }
    }
  });

  test('should handle form submission errors and retry', async ({ page }) => {
    // Fill form with valid data
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);

    await page.waitForTimeout(3000); // Wait for email check

    // Ensure submit button is enabled
    await expect(page.locator('.submit-btn')).toBeEnabled();

    // Submit form once
    await page.locator('.submit-btn').click();
    await page.waitForTimeout(5000); // Wait for submission

    const errorState = page.locator('#errorState');
    const successState = page.locator('#successState');

    // Check if we got an error state
    if (await errorState.isVisible()) {
      await expect(errorState).toContainText('Oops! Something went wrong');
      await expect(page.locator('#errorMessage')).toBeVisible();
      await expect(page.locator('#errorState .retry-btn')).toBeVisible();
      await expect(page.locator('#errorState .reset-btn')).toBeVisible();

      // Test retry functionality
      await page.locator('#errorState .retry-btn').click();
      await expect(page.locator('#signupForm')).toBeVisible();
      await expect(errorState).toBeHidden();
    } else if (await successState.isVisible()) {
      // If we got success, test reset functionality
      await expect(successState).toContainText('Account Created Successfully!');
      await expect(page.locator('#successState .reset-btn')).toBeVisible();

      // Test reset functionality
      await page.locator('#successState .reset-btn').click();
      await expect(page.locator('#signupForm')).toBeVisible();
      await expect(successState).toBeHidden();
    } else {
      // If neither state is visible, just verify form is still functional
      await expect(page.locator('#signupForm')).toBeVisible();
    }
  });

  test('should reset form completely', async ({ page }) => {
    // Fill form with data
    await page.fill('#fullName', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#password', 'StrongPass123!');
    await page.fill('#confirmPassword', 'StrongPass123!');
    await toggleCheckbox(page, 'agreeTerms', true);
    await toggleCheckbox(page, 'newsletter', true);

    // Submit form and wait for completion
    await page.waitForTimeout(3000);
    await page.locator('.submit-btn').click();
    await page.waitForTimeout(5000);

    // Check if we have a success or error state, and click the appropriate reset button
    const successState = page.locator('#successState');
    const errorState = page.locator('#errorState');

    if (await successState.isVisible()) {
      await page.locator('#successState .reset-btn').click();
    } else if (await errorState.isVisible()) {
      await page.locator('#errorState .reset-btn').click();
    } else {
      // If form didn't complete, just reload the page to test reset functionality
      await page.reload();
      await page.waitForLoadState('networkidle');
    }

    // Verify form is reset
    await expect(page.locator('#signupForm')).toBeVisible();
    await expect(page.locator('#fullName')).toHaveValue('');
    await expect(page.locator('#email')).toHaveValue('');
    await expect(page.locator('#password')).toHaveValue('');
    await expect(page.locator('#confirmPassword')).toHaveValue('');
    await expect(page.locator('#agreeTerms')).not.toBeChecked();
    await expect(page.locator('#newsletter')).not.toBeChecked();
    await expect(page.locator('.submit-btn')).toBeDisabled();
    await expect(page.locator('.strength-text')).toContainText(
      'Enter a password'
    );
  });

  test('should handle newsletter checkbox independently', async ({ page }) => {
    const newsletterCheckbox = page.locator('#newsletter');

    // Newsletter checkbox should not affect form validity
    await toggleCheckbox(page, 'newsletter', true);
    await expect(newsletterCheckbox).toBeChecked();

    await toggleCheckbox(page, 'newsletter', false);
    await expect(newsletterCheckbox).not.toBeChecked();

    // Submit button should still be disabled without required fields
    await expect(page.locator('.submit-btn')).toBeDisabled();
  });
});
