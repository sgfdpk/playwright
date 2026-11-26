import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_BASE_URL = 'https://restful-booker.herokuapp.com';

export async function createToken(
  request: APIRequestContext,
  username: string,
  password: string,
): Promise<string | undefined> {
  const response = await request.post(`${API_BASE_URL}/auth`, {
    data: { username, password },
  });

  if (!response.ok()) {
    return undefined;
  }

  const body: { token?: string } = await response.json();
  return body.token;
}

export async function loginToSauceDemo(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  await page.goto('https://www.saucedemo.com/');
  await expect(page.locator('[data-test="username"]')).toBeVisible();
  await expect(page.locator('[data-test="password"]')).toBeVisible();
  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
}