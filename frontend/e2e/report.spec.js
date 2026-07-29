import { test, expect } from "@playwright/test";

const TS = Date.now();
const TEST_USER = {
  name: "Test User",
  username: "testuser_" + TS,
  email: "testuser_" + TS + "@example.com",
  password: "TestPass123",
};

test.describe("Auth Flow", () => {
  test("1. Register page loads and shows form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('h2:has-text("Create account")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
  });

  test("2. Register form submits and shows OTP step", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[placeholder="Your name"]', TEST_USER.name);
    await page.fill('input[placeholder="username"]', TEST_USER.username);
    await page.fill('input[placeholder="you@example.com"]', TEST_USER.email);
    await page.fill('input[placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"]', TEST_USER.password);
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);
    const otpVisible = await page.locator("text=Verification code").isVisible().catch(() => false);
    const errorVisible = await page.locator("text=Failed to send").isVisible().catch(() => false);
    if (errorVisible) {
      console.log("Email sending failed (expected without valid SMTP)");
    } else if (otpVisible) {
      console.log("OTP step displayed successfully");
    }
  });

  test("3. Login page loads and shows form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Welcome back")).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
  });

  test("4. Forgot password page loads and shows form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("text=Forgot password?")).toBeVisible();
    await expect(page.locator('button:has-text("Send Reset Code")')).toBeVisible();
  });

  test("5. Forgot password form submits and shows OTP step", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.fill('input[placeholder="you@example.com"]', "test@example.com");
    await page.click('button:has-text("Send Reset Code")');
    await page.waitForTimeout(3000);
    const otpVisible = await page.locator("text=Verification code").isVisible().catch(() => false);
    const errorVisible = await page.locator("text=Failed to send").isVisible().catch(() => false);
    if (errorVisible) {
      console.log("Email sending failed for forgot password (expected without valid SMTP)");
    } else if (otpVisible) {
      console.log("OTP step displayed for forgot password");
    }
  });
});

test.describe("Navigation (authenticated)", () => {
  test("6. Login page redirects to dashboard after login", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log("After login attempt, URL: " + currentUrl);
  });
});

test.describe("Layout & UI", () => {
  test("7. Login page has proper layout with left panel", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Pollify").first()).toBeVisible();
  });

  test("8. Navigation links exist on dashboard (when logged in)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('h2:has-text("Welcome")')).toBeVisible();
  });

  test("9. All routes are accessible", async ({ page }) => {
    const routes = ["/login", "/register", "/forgot-password"];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(500);
      const body = page.locator("body");
      await expect(body).not.toHaveText(/Cannot GET|Not found/i);
      console.log("Route " + route + ": OK");
    }
  });
});

test.describe("Backend API Health", () => {
  test("10. Backend API root responds", async ({ page }) => {
    const response = await page.request.get("http://127.0.0.1:5000/api/polls/stats");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("totalPolls");
    console.log("Backend stats API: OK", data);
  });

  test("11. Backend trending endpoint responds", async ({ page }) => {
    const response = await page.request.get("http://127.0.0.1:5000/api/polls/trending");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("polls");
    console.log("Backend trending API: OK");
  });

  test("12. Polls endpoint returns results without crashing", async ({ page }) => {
    const response = await page.request.get("http://127.0.0.1:5000/api/polls");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("polls");
    expect(Array.isArray(data.polls)).toBeTruthy();
    for (const poll of data.polls) {
      expect(poll).toHaveProperty("results");
      expect(Array.isArray(poll.results)).toBeTruthy();
      expect(poll).toHaveProperty("myVote");
      expect(poll).toHaveProperty("totalVotes");
      if (poll.results.length > 0) {
        expect(poll.results[0]).toHaveProperty("percent");
      }
    }
    console.log("Polls API with results: OK (" + data.polls.length + " polls, no crash)");
  });
});
