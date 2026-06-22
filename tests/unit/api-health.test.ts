import { describe, expect, it } from 'bun:test'
import { app } from '../../src/api/index'

describe('GET /api/health', () => {
	it('returns ok status and service name', async () => {
		const res = await app.request('/api/health')
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.ok).toBe(true)
		expect(body.service).toBe('website-fotang-daxin')
		expect(typeof body.ts).toBe('string')
	})
})
