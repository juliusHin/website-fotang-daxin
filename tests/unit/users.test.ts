import { describe, expect, it } from 'node:test'
import assert from 'node:assert'
import { generateQrCode, validateQrCode } from '../../src/lib/server/utils/qr-code'
import {
	createUserSchema,
	vegetarianStatusSchema,
	userContactSchema,
	type CreateUserInput,
} from '../../src/lib/shared/validators/users'

describe('QR Code Utils', () => {
	it('should generate valid QR codes', () => {
		const qr1 = generateQrCode()
		const qr2 = generateQrCode()

		assert.strictEqual(validateQrCode(qr1), true)
		assert.strictEqual(validateQrCode(qr2), true)
		assert.notStrictEqual(qr1, qr2)
	})

	it('should validate QR code format', () => {
		assert.strictEqual(validateQrCode('FD-a1b2c3d4e5f6'), true)
		assert.strictEqual(validateQrCode('FD-ABCDEF123456'), true)
		assert.strictEqual(validateQrCode('INVALID'), false)
		assert.strictEqual(validateQrCode('FD-123'), false)
	})
})

describe('User Validators', () => {
	it('should validate vegetarian status enum', () => {
		assert.strictEqual(vegetarianStatusSchema.safeParse('belum').success, true)
		assert.strictEqual(vegetarianStatusSchema.safeParse('belajar').success, true)
		assert.strictEqual(vegetarianStatusSchema.safeParse('ikrar').success, true)
		assert.strictEqual(vegetarianStatusSchema.safeParse('invalid').success, false)
	})

	it('should validate user contact schema', () => {
		const validContact = {
			type: 'whatsapp' as const,
			value: '+628123456789',
		}

		assert.strictEqual(userContactSchema.safeParse(validContact).success, true)
		assert.strictEqual(userContactSchema.safeParse({ type: 'invalid' as const, value: '123' }).success, false)
	})

	it('should validate create user schema', () => {
		const validUser: CreateUserInput = {
			fullName: 'Test User',
			vegetarianStatus: 'belum',
			qrCode: generateQrCode(),
		}

		const result = createUserSchema.safeParse(validUser)
		assert.strictEqual(result.success, true)

		const invalidUser = {
			fullName: '',
			vegetarianStatus: 'invalid',
			qrCode: 'invalid',
		}

		assert.strictEqual(createUserSchema.safeParse(invalidUser).success, false)
	})

	it('should enforce max length constraints', () => {
		const tooLongName = 'A'.repeat(256)
		const user = {
			fullName: tooLongName,
			vegetarianStatus: 'belum',
			qrCode: generateQrCode(),
		}

		assert.strictEqual(createUserSchema.safeParse(user).success, false)
	})

	it('should require full name and qr code', () => {
		const user = {
			vegetarianStatus: 'belum',
			qrCode: generateQrCode(),
		}

		assert.strictEqual(createUserSchema.safeParse(user).success, false)
	})
})