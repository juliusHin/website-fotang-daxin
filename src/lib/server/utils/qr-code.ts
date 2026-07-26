import { createHash, randomUUID } from 'node:crypto'

export function generateQrCode(): string {
	const uuid = randomUUID()
	const hash = createHash('sha256').update(uuid).digest('hex')
	const prefix = hash.substring(0, 12)
	return `FD-${prefix}`
}

export function validateQrCode(qrCode: string): boolean {
	return /^FD-[a-fA-F0-9]{12,}$/.test(qrCode)
}
