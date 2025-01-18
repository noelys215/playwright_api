import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';

// test.beforeEach(async ({ page }) => {
// 	await page.route('*/**/api/tags', async (route) => {
// 		await route.fulfill({
// 			body: JSON.stringify(tags),
// 		});
// 	});

// 	await page.goto('https://conduit.bondaracademy.com/');
// });

test('has title', async ({ page }) => {
	await page.route('*/**/api/articles*', async (route) => {
		const response = await route.fetch();
		const responseBody = await response.json();
		responseBody.articles[0].title = 'Test a mock test title';
		responseBody.articles[0].description = 'Test mock test description';

		await route.fulfill({ body: JSON.stringify(responseBody) });
	});

	await page.getByText('Global Feed').click();

	await expect(page.locator('.navbar-brand')).toHaveText('conduit');
	await page.waitForTimeout(500);
	await expect(page.locator('app-article-list h1').first()).toContainText(
		'Test a mock test title'
	);
	await page.waitForTimeout(500);
	await expect(page.locator('app-article-list p').first()).toContainText(
		'Test mock test description'
	);
	await page.waitForTimeout(500);
});

test('delete article', async ({ page, request }) => {
	const response = await request.post('https://conduit.bondaracademy.com/login', {
		data: {
			user: { email: 'lavalamps@gmail.com', password: 'test123' },
		},
	});

	const responseBody = await response.json();
	console.log(responseBody);
});

/*
App: https://conduit.bondaracademy.com/
		https://conduit-api.bondaracademy.com
API: https://conduit-api.bondaracademy.com/api/
 */
