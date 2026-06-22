import { z } from 'zod'
import { env as privateEnv } from '$env/dynamic/private'
import { env as publicEnv } from '$env/dynamic/public'

const optionalUrl = z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional())

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PUBLIC_SITE_URL: z.string().url(),
	LOG_LEVEL: z.string().default('info'),

	DATABASE_URL: z.string().optional(),
	BETTER_AUTH_SECRET: z.string().optional(),
	BETTER_AUTH_URL: optionalUrl,
	R2_ACCOUNT_ID: z.string().optional(),
	R2_ACCESS_KEY_ID: z.string().optional(),
	R2_SECRET_ACCESS_KEY: z.string().optional(),
	R2_BUCKET: z.string().optional(),
	R2_PUBLIC_BASE_URL: optionalUrl,
	RESEND_API_KEY: z.string().optional(),
})

const raw = { ...privateEnv, ...publicEnv }

function load() {
	const parsed = schema.safeParse(raw)
	if (!parsed.success) {
		const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
		throw new Error(`Invalid environment variables: ${issues}`)
	}
	return parsed.data
}

export const env = load()
