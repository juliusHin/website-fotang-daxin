import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

export const vegetarianStatuses = pgTable('vegetarian_statuses', {
	id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
	name: varchar('name', { length: 50 }).notNull().unique(),
})

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	fullName: varchar('full_name', { length: 255 }).notNull(),
	mandarinName: varchar('mandarin_name', { length: 255 }),
	gender: varchar('gender', { length: 10 }),
	birthDate: text('birth_date').$type<Date>(),
	address: text('address'),
	phoneWhatsapp: varchar('phone_whatsapp', { length: 20 }),
	dhamma1DayCompleted: boolean('dhamma_1_day_completed').notNull().default(false),
	dhamma3DayCompleted: boolean('dhamma_3_day_completed').notNull().default(false),
	vegetarianStatus: varchar('vegetarian_status', { length: 20 }).notNull(),
	qrCode: text('qr_code').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const userContacts = pgTable(
	'user_contacts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: varchar('type', { length: 20 }).notNull(),
		value: varchar('value', { length: 50 }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.id] }),
	}),
)
