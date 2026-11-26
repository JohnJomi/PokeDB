import { expect, test } from "@playwright/test";

test("search, open, shiny, moves, evolution and back", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search by name or number").fill("charmander");
  await expect(page).toHaveURL(/q=charmander/);
  await page.getByRole("link", { name: "Open entry" }).click();
  await expect(page).toHaveURL(/\/pokemon\/charmander/);

  await page.getByRole("button", { name: "Shiny", exact: false }).first().click();
  await expect(page.getByRole("img", { name: "Shiny Charmander" })).toBeVisible();

  await page.getByRole("button", { name: "moves", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "info", exact: true }).click();

  await page.getByRole("region", { name: "Evolution" }).getByRole("link", { name: /Charmeleon/ }).click();
  await expect(page).toHaveURL(/\/pokemon\/charmeleon/);
  await page.goBack();
  await expect(page).toHaveURL(/\/pokemon\/charmander/);
  await page.goBack();
  await expect(page.getByLabel("Search by name or number")).toHaveValue("charmander");
});

test("unknown slug gives 404", async ({ page }) => {
  const response = await page.goto("/pokemon/missingno");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("NO SIGNAL")).toBeVisible();
});

test("mobile width has no horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ["/", "/pokemon/charizard", "/pokemon/eevee", "/pokemon/charizard?tab=moves", "/pokemon/pikachu?tab=forms", "/about"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
