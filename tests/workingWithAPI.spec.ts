import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({ page }) => {
	await page.route('*/**/api/tags', async (route) => {
		await route.fulfill({
			body: JSON.stringify(tags),
		});
	});

	await page.route('*/**/api/articles*', async (route) => {
		const response = await route.fetch();
		const responseBody = await response.json();
		responseBody.articles[0].title = 'Test title';
		responseBody.articles[0].description = 'Test description';

		await route.fulfill({ body: JSON.stringify(responseBody) });
	});

	await page.goto('https://conduit.bondaracademy.com/');
});

test('has title', async ({ page }) => {
	await expect(page.locator('.navbar-brand')).toHaveText('conduit');
	await page.waitForTimeout(500);
	await expect(page.locator('app-article-list h1').first()).toContainText('Test title');
	await page.waitForTimeout(500);
	await expect(page.locator('app-article-list p').first()).toContainText('Test description');
	await page.waitForTimeout(500);
});

/*
App: https://conduit.bondaracademy.com/
		https://conduit-api.bondaracademy.com
API: https://conduit-api.bondaracademy.com/api/
 */
