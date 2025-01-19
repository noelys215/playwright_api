import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({ page }) => {
	await page.route('*/**/api/tags', async (route) => {
		await route.fulfill({
			body: JSON.stringify(tags),
		});
	});

	await page.goto('https://conduit.bondaracademy.com/');
	await page.getByText('Sign in').click();
	await page.getByRole('textbox', { name: 'Email' }).fill('lavalamps@gmail.com');
	await page.getByRole('textbox', { name: 'Password' }).fill('test123');
	await page.getByRole('button').click();
});

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
	const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
		data: {
			user: { email: 'lavalamps@gmail.com', password: 'test123' },
		},
	});

	const responseBody = await response.json();
	const accessToken = responseBody.user.token;

	const articleResponse = await request.post(
		'https://conduit-api.bondaracademy.com/api/articles',
		{
			data: {
				article: {
					tagList: [],
					title: 'This is a test title',
					description: 'This is a test description',
					body: 'This is a test body',
				},
			},
			headers: {
				Authorization: `Token ${accessToken}`,
			},
		}
	);

	expect(articleResponse.status()).toEqual(201);

	await page.getByText('Global Feed').click();
	await page.getByText('This is a test title').click();
	await page.getByRole('button', { name: 'Delete Article' }).first().click();
	await page.getByText('Global Feed').click();

	await expect(page.locator('app-article-list p').first()).not.toContainText(
		'This is a test title'
	);
});

/*
App: https://conduit.bondaracademy.com/
		https://conduit-api.bondaracademy.com
API: https://conduit-api.bondaracademy.com/api/
 */
