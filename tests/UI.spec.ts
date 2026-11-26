import { test, expect } from '@playwright/test';
import { loginToSauceDemo } from './tools/tools';

test('login/logout normal', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');
  expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.locator('[data-test="logout-sidebar-link"]').click();
  expect(page.locator('[data-test="username"]')).toBeVisible();
  expect(page.locator('[data-test="password"]')).toBeVisible();
  expect(page.locator('[data-test="login-button"]')).toBeVisible();
});

test('login fails with an incorrect password', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await loginToSauceDemo(page, 'standard_user', '\' OR \'1\'=\'1');
  expect(page.locator('[data-test="login-button"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toHaveText(
    'Epic sadface: Username and password do not match any user in this service',
  );
});

test('empty shopping card', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');
  await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('[data-test="inventory-item"]')).not.toBeVisible();
  await expect(page.locator('[data-test="checkout"]')).not.toBeEnabled();
  page.locator('[data-test="continue-shopping"]').click();
  await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  });

test('add/remove shopping card', async ({ page }) => {
   await loginToSauceDemo(page, 'standard_user', 'secret_sauce');
   await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
   await page.locator('xpath=//*[@id="inventory_container"]//div[@class="inventory_item"][1]//button').click();
   await page.locator('[data-test="shopping-cart-link"]').click();
   await expect(page.locator('[data-test="inventory-item"]')).toBeVisible();
   await expect(page.locator('xpath=//*[contains(@id,"remove")]')).toBeVisible();
   await expect(page.locator('[data-test="checkout"]')).toBeEnabled();

   await page.locator('xpath=//*[contains(@id,"remove")]').click();
   await expect(page.locator('[data-test="inventory-item"]')).not.toBeVisible();
   await expect(page.locator('[data-test="checkout"]')).not.toBeEnabled();
   await page.locator('[data-test="continue-shopping"]').click();
   await page.locator('xpath=//*[@id="inventory_container"]//div[@class="inventory_item"][1]//button').click();
});

test('add the same product twice to the shopping cart', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');

  const addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
  await addToCartButton.click();
  await expect(addToCartButton).toBeVisible();
  await addToCartButton.click();

  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('.cart_quantity')).toHaveText('2');
});

test('opening product item', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');
  await expect(page.locator('xpath=//*[@class=\'inventory_item_description\']//a[@role=\'button\']').first()).toBeVisible();
  const product = page.locator('xpath=//*[@class="inventory_item"]').first();
  const productName = await product.locator('xpath=//*[@class="inventory_item_name "]').innerText();
  const productDescription = await product.locator('xpath=//*[@class="inventory_item_desc"]').innerText();
  const productPrice = await product.locator('xpath=//*[@class="inventory_item_price"]').innerText();
  await product.locator('xpath=//*[@class=\'inventory_item_description\']//a[@role=\'button\']').click();
  await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(productName);
  await expect(page.locator('[data-test="inventory-item-desc"]')).toHaveText(productDescription);
  await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(productPrice);
});

test('open each product and check its URL', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');

  const productIds = ['4', '0', '1', '5', '2', '3'];
  for (const productId of productIds) {
    await page.locator(`[data-test="item-${productId}-title-link"]`).click();
    await expect(page).toHaveURL(
      `https://www.saucedemo.com/inventory-item.html?id=${productId}`,
    );
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  }
});

test('open Dynamic Catalog options', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('button', { name: 'Dynamic Catalog' }).click();
  await page.getByRole('button', { name: 'Slider' }).click();
  await expect(page.locator('[data-test="title"]')).toHaveText('Dynamic Catalog - Slider');
  await expect(page).toHaveURL('https://www.saucedemo.com/dynamic-catalog-slider.html');

 await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('button', { name: 'Dynamic Catalog' }).click();
  await page.getByRole('button', { name: 'Lazy Load' }).click();
  await expect(page.locator('[data-test="title"]')).toHaveText('Dynamic Catalog - Lazy Load');
  await expect(page).toHaveURL('https://www.saucedemo.com/dynamic-catalog-lazy-load.html');

  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('button', { name: 'Dynamic Catalog' }).click();
  await page.getByRole('button', { name: 'Spinner' }).click();
  await expect(page.locator('[data-test="title"]')).toHaveText('Dynamic Catalog - Spinner');
  await expect(page).toHaveURL('https://www.saucedemo.com/dynamic-catalog-spinner.html');
});

test('add shopping card and checkout', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');
  await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  await page.locator('xpath=//*[@id="inventory_container"]//div[@class="inventory_item"][1]//button').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('[data-test="inventory-item"]')).toBeVisible();
  await expect(page.locator('[data-test="checkout"]')).toBeEnabled();

  await page.locator('[data-test="checkout"]').click();
  await expect(page.locator('[data-test="firstName"]')).toBeVisible();
  await expect(page.locator('[data-test="lastName"]')).toBeVisible();
  await expect(page.locator('[data-test="postalCode"]')).toBeVisible();
  await page.locator('[data-test="firstName"]').fill('ara');
  await page.locator('[data-test="lastName"]').fill('ara');
  await page.locator('[data-test="postalCode"]').fill('6666');

  await page.locator('[data-test="continue"]').click();
  await expect(page.locator('[data-test="finish"]')).toBeVisible();
  await page.locator('[data-test="finish"]').click();
  await expect(page.locator('[data-test="complete-header"]')).toBeVisible();
  await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
});

test('sorting ', async ({ page }) => {
  await loginToSauceDemo(page, 'standard_user', 'secret_sauce');
  await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  await page.locator('[data-test="product-sort-container"]').click();
  await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
  let products = await page.locator('xpath=//*[@class="inventory_item_price"]').all();
  let prices = [];
  for (const product of products) {
    const priceText = await product.textContent();
    if (priceText) {
      prices.push(parseFloat(priceText.replace('$', '')));
    }
  }
  const sortedPrices = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sortedPrices);
  await page.locator('[data-test="product-sort-container"]').click();
  await page.locator('[data-test="product-sort-container"]').selectOption('az');
  products = await page.locator('xpath=//*[@class="inventory_item_name "]').all();
  prices = [];
  for (const product of products) {
    const priceText = await product.textContent();
    if (priceText) {
      prices.push(priceText);
    }
  }
  const sortedNames = [...prices].sort();
  expect(prices).toEqual(sortedNames);
  });