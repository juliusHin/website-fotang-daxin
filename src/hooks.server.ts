import type { Handle } from '@sveltejs/kit'
import { handleApi } from './api'
import { logger } from './lib/server/logger'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.logger = logger

	if (event.url.pathname.startsWith('/api/')) {
		return await handleApi(event.request)
	}

	return await resolve(event)
}
