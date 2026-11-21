const { test, expect } = require("@playwright/test");

test("search shows results for the entered term", async ({ page }) => {
  await page.goto(`file://${require("node:path").join(__dirname, "search.html")}`);
  await page.getByRole("searchbox", { name: "Search guides" }).fill("Fabric");
  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Fabric CI/CD");
});
