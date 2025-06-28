# **Solving Annoying Testing Problems: Playwright vs. AI-Driven Testing**

<aside>
💡

The test website is available [here](https://literallydotdev.github.io/playwright-qa-tech/).

The code is available [here](https://github.com/literallydotdev/playwright-qa-tech).

---

### Overview

**Intro**

- What's the issue, set the stage

**Handling Complex UI Elements with Playwright**

- Dynamic sign-up form example
- Embedded Maps example
- Unpredictable popups example

**Simplifying Testing with AI-Driven QA**

- Introduce QA tech
- Set up the 3 different tests

**Address Objections**

**Real-World Examples/Case Studies**

**Wrap it Up**

**CTA**

</aside>

I've been there, and you've probably been there too: everything seems great with your tests, then suddenly, a UI change breaks everything. It feels like perpetually building on top of sand. One more damn test breaks and your trust issues will start affecting your relationships.

Dynamic form validation, unpredictable popups, and interactive maps turn routine testing into a tedious nightmare.

While tools like [Playwright](https://playwright.dev/) have significantly improved automated testing, they often require careful scripting, frequent updates, and still struggle with certain UI complexities.

In this article, we'll explore how traditional scripted automation with Playwright tackles some notoriously challenging UI elements, then contrast it with an AI-driven testing approach.

By the end of the article you should have a clear picture of when you should stick with traditional automation and when to consider picking up AI for the job.

## Handling Complex UI Elements with Playwright

### Scenario 1: Dynamic Sign-Up Form

Testing sign-up forms with Playwright reveals several timing and validation challenges:

```tsx
// Fill form with real-time validation
await page.fill('#fullName', 'John Doe');
await page.fill('#email', 'john@example.com');
await page.fill('#password', 'SecurePass123!');
await page.fill('#confirmPassword', 'SecurePass123!');

// Wait for async email validation - unpredictable timing
await page.waitForTimeout(3000); // Hope it's enough time

// Handle dynamic password strength indicator
await expect(page.locator('.strength-bar.strong')).toBeVisible();

// Submit with variable loading states
await page.check('#agreeTerms');
await page.click('.submit-btn');
await expect(page.locator('.btn-text')).toHaveText('Creating Account...');

// Form submission has random failures (30% chance)
try {
  await expect(page.locator('.success-state')).toBeVisible({ timeout: 8000 });
} catch (error) {
  // Handle random failure and retry logic
  if (await page.locator('.error-state').isVisible()) {
    await page.click('.retry-btn');
    await page.click('.submit-btn');
  }
}
```

This script assumes validation timing is consistent, password strength indicators update predictably, and loading durations don't vary—all challenges that make tests brittle in real applications.

### Scenario 2: Embedded Google Maps

Interacting with embedded maps often involves navigating layers of DOM elements:

```tsx
const mapFrame = page.frameLocator('iframe[src*="google.com/maps"]');
await mapFrame.locator('button[aria-label="Zoom in"]').click();
```

Maintaining such selectors can become tedious as Google Maps frequently updates its DOM structure.

### Scenario 3: Unpredictable Popups

Handling unpredictable popups can be tricky, especially if they don't consistently appear:

```tsx
if (await page.isVisible('.popup-modal')) {
  await page.click('.popup-modal .close-btn');
}
```

Even with defensive coding, flaky tests will creep in, causing frustrating and unnecessary test maintenance.

## Simplifying Testing with AI-Driven QA

QA.tech takes a fundamentally different approach by learning your application and automatically adapting tests. Bla bla bla bla

<aside>
💡

Maybe we should blur the bg behind the popups here?

</aside>

![image.png](attachment:b10ecb53-f35b-483c-88c2-069d875eda12:image.png)

![image.png](attachment:d4703740-bd08-4e43-bc58-0df650a76544:image.png)

![image.png](attachment:754e03d2-ec15-4f35-a9bf-3d75decd1eef:image.png)

![image.png](attachment:f3aaea7f-e557-460c-ba42-d937bf90cf0d:image.png)

### Scenario 1: Dynamic Sign-Up Form

Instead of writing brittle scripts with hardcoded timeouts, QA.tech intelligently handles form validation timing, adapts to dynamic UI feedback like password strength indicators, and gracefully manages unpredictable submission states—automatically adjusting as your form behavior evolves.

[ screenshot ]

![image.png](attachment:9dbaa289-21ad-4274-8e49-25cd16cc30ad:image.png)

### Scenario 2: Embedded Google Maps

QA.tech intelligently adapts to frequent DOM changes in embedded third-party apps like Google Maps, significantly reducing the time you spend maintaining brittle selectors.

[ screenshot ]

### Scenario 3: Unexpected Popups

AI-driven tests anticipate and handle popups seamlessly, reducing flakiness and improving reliability without defensive coding.

<aside>
💡

Should there be a gif here showing how the agent is interacting with the UI?

</aside>

[ screenshot ]

## Common Objections to AI Testing??

- **AI can't handle our complex, custom components.**
  - AI isn't a silver bullet for every test case. However, it's ideal for handling dynamic elements and repetitive maintenance tasks, freeing QA engineers for more complex scenarios.
- **AI testing is a black box.**
  - QA.tech provides clear logs and actionable insights, ensuring transparency and control.
- **What happens when the AI gets it wrong?**
- **It'll take too long/too costly to "train" the AI on our app?**
- **Sounds expensive**
- **We'll get locked in…**

## Real-World Example / Case Studies

Companies leveraging QA.tech's AI testing report significant reductions in test maintenance blabidi bla bla case studies here

- Case study uno
- Case study dos

## Choose the Right Tool for the Job

Playwright and traditional scripted automation remain valuable, however, AI-driven testing solutions like QA.tech offer compelling benefits for testing dynamic and complex UI elements. Less scripting, lower maintenance, and more reliable tests are possible by adopting AI powered QA.

CTA
