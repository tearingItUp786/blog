import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

describe('mobile navbar stacking', () => {
	it('places the mobile menu above sticky page content', () => {
		const navbar = readFileSync(
			path.join(process.cwd(), 'app/components/navbar/navbar.tsx'),
			'utf8',
		)

		expect(navbar).toContain('relative z-30')
		expect(navbar).toContain('lg:z-auto')
	})
})
