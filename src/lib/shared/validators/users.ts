import { z } from 'zod'

export const vegetarianStatusSchema = z.enum(['belum', 'belajar', 'ikrar'])

export const userContactSchema = z.object({
	type: z.enum(['whatsapp', 'phone', 'email']),
	value: z.string().max(50),
})

export const createUserSchema = z.object({
	fullName: z.string().min(1).max(255),
	mandarinName: z.string().max(255).optional(),
	gender: z.enum(['L', 'P', 'Other']).optional(),
	birthDate: z.coerce.date().optional(),
	address: z.string().optional(),
	phoneWhatsapp: z.string().max(20).optional(),
	dhamma1DayCompleted: z.boolean().default(false),
	dhamma3DayCompleted: z.boolean().default(false),
	vegetarianStatus: vegetarianStatusSchema,
	qrCode: z.string().regex(/^FD-[a-fA-F0-9]+$/),
	contacts: z.array(userContactSchema).optional(),
})

export const updateUserSchema = createUserSchema.partial()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type VegetarianStatus = z.infer<typeof vegetarianStatusSchema>
export type UserContact = z.infer<typeof userContactSchema>
