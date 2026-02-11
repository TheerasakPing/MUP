import { test, expect } from "@playwright/test";

test.describe("Workspace Templates E2E", () => {
  test("should create and use a workspace template", async ({ page }) => {
    await page.goto("/");

    // Open template manager
    await page.click('[data-testid="create-from-template-button"]');

    // Create new template
    await page.click("text=New Template");
    await page.fill('[name="templateName"]', "E2E Test Template");
    await page.fill('[name="templateDescription"]', "Created by E2E test");
    await page.selectOption('[name="runtime"]', "local");
    await page.click("text=Save Template");

    // Verify template appears in list
    await expect(page.locator("text=E2E Test Template")).toBeVisible();

    // Use the template
    await page.click("text=Use", { hasText: "E2E Test Template" });

    // Verify workspace created with template settings
    await expect(page.locator('[data-testid="workspace-runtime"]')).toHaveText("local");
  });

  test("should export and import templates", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="create-from-template-button"]');

    // Export templates
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("text=Export"),
    ]);

    expect(download.suggestedFilename()).toMatch(/mux-templates-.*\.json/);

    // Import templates
    await page.setInputFiles('input[type="file"][accept=".json"]', {
      name: "test-templates.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify([
          {
            id: "imported-test",
            name: "Imported Template",
            runtime: "docker",
            created: Date.now(),
          },
        ])
      ),
    });

    await expect(page.locator("text=Imported Template")).toBeVisible();
  });
});

test.describe("Workspace Favorites E2E", () => {
  test("should pin and unpin workspaces", async ({ page }) => {
    await page.goto("/");

    // Create test workspace
    await page.click('[data-testid="new-workspace-button"]');
    await page.fill('[data-testid="workspace-name-input"]', "Test Workspace");
    await page.click('[data-testid="create-workspace-confirm"]');

    // Pin the workspace
    await page.click('[data-testid="workspace-favorite-button"]');

    // Verify workspace shows as favorited
    await expect(page.locator('[data-testid="workspace-favorite-icon"]')).toHaveClass(/favorited/);

    // Verify workspace appears at top of list
    const firstWorkspace = page.locator('[data-testid="workspace-list-item"]').first();
    await expect(firstWorkspace).toContainText("Test Workspace");

    // Unpin the workspace
    await page.click('[data-testid="workspace-favorite-button"]');
    await expect(page.locator('[data-testid="workspace-favorite-icon"]')).not.toHaveClass(
      /favorited/
    );
  });

  test("should persist favorites across page reload", async ({ page }) => {
    await page.goto("/");

    // Pin workspace
    await page.click('[data-testid="workspace-favorite-button"]');

    // Reload page
    await page.reload();

    // Verify favorite persisted
    await expect(page.locator('[data-testid="workspace-favorite-icon"]')).toHaveClass(/favorited/);
  });
});

test.describe("Token Prediction E2E", () => {
  test("should show token prediction when typing", async ({ page }) => {
    await page.goto("/");

    // Navigate to workspace
    await page.click('[data-testid="workspace-list-item"]');

    // Type in chat input
    await page.fill('[data-testid="chat-input"]', "This is a test message for token prediction");

    // Wait for debounce and prediction to appear
    await page.waitForTimeout(350);

    // Verify prediction banner appears
    await expect(page.locator('[data-testid="token-prediction-banner"]')).toBeVisible();
    await expect(page.locator("text=/~\\d+ tokens/")).toBeVisible();
    await expect(page.locator("text=/\\$\\d+\\.\\d+ estimated/")).toBeVisible();
  });

  test("should show warning for large context", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="workspace-list-item"]');

    // Type very long message
    const longMessage = "x".repeat(100000);
    await page.fill('[data-testid="chat-input"]', longMessage);
    await page.waitForTimeout(350);

    // Verify warning appears
    const banner = page.locator('[data-testid="token-prediction-banner"]');
    await expect(banner).toHaveClass(/warning|critical/);
    await expect(banner.locator("text=/optimization|split|reduce/")).toBeVisible();
  });
});

test.describe("Analytics Dashboard E2E", () => {
  test("should display performance metrics", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="workspace-list-item"]');

    // Open right sidebar analytics tab
    await page.click('[data-testid="right-sidebar-tab-analytics"]');

    // Verify analytics components appear
    await expect(page.locator("text=Performance Analytics")).toBeVisible();
    await expect(page.locator("text=Agent Success Rates")).toBeVisible();
    await expect(page.locator("text=Model Performance")).toBeVisible();
  });

  test("should filter by time range", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="workspace-list-item"]');
    await page.click('[data-testid="right-sidebar-tab-analytics"]');

    // Change time range
    await page.click("text=7 Days");

    // Verify filter applied (check for URL param or visual change)
    await expect(page.locator('[data-state="on"]').filter({ hasText: "7 Days" })).toBeVisible();
  });

  test("should export analytics CSV", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="workspace-list-item"]');
    await page.click('[data-testid="right-sidebar-tab-analytics"]');

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("text=Export Analytics CSV"),
    ]);

    expect(download.suggestedFilename()).toMatch(/.*\.csv/);
  });
});
