import { z } from 'zod'

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PUBLIC_SITE_URL: z.string().url(),
	LOG_LEVEL: z.string().default('info'),

	DATABASE_URL: z.string().optional(),
	BETTER_AUTH_SECRET: z.string().optional(),
	BETTER_AUTH_URL: z.string().url().optional(),
	R2_ACCOUNT_ID: z.string().optional(),
	R2_ACCESS_KEY_ID: z.string().optional(),
	R2_SECRET_ACCESS_KEY: z.string().optional(),
	R2_BUCKET: z.string().optional(),
	R2_PUBLIC_BASE_URL: z.string().url().optional(),
	RESEND_API_KEY: z.string().optional(),
})

function load() {
	const parsed = schema.safeParse(process.env)
	if (!parsed.success) {
		const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
		throw new Error(`Invalid environment variables: ${issues}`)
	}
	return parsed.data
}

export const env = load()
