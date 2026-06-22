import { Hono } from 'hono'

export const app = new Hono()

app.get('/api/health', (c) => {
	return c.json({
		ok: true,
		service: 'website-fotang-daxin',
		ts: new Date().toISOString(),
	})
})

/** Titik delegasi tunggal yang dipakai hooks.server.ts & forwarder. */
export async function handleApi(request: Request): Promise<Response> {
	return app.fetch(request)
}
