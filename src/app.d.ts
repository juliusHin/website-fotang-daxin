import type { Logger } from 'pino'

declare global {
	namespace App {
		interface Locals {
			logger: Logger
		}
		interface Error {}
		interface PageData {}
		interface PageState {}
	}
}
