import { expect, test } from '@playwright/test'

test('homepage shows the community heading', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { name: 'Fotang Daxin' })).toBeVisible()
})

test('health endpoint returns ok via dev server', async ({ request }) => {
	const res = await request.get('/api/health')
	expect(res.status()).toBe(200)
	const body = await res.json()
	expect(body.ok).toBe(true)
})
