import { handleApi } from '../../../api'
import type { RequestHandler } from './$types'

const forward: RequestHandler = ({ request }) => handleApi(request)

export const GET = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
