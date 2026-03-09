import { describe, expect, it, vi } from 'vitest'
import { adjustUtcForBC } from '~/utils/misc'

describe('adjustUtcForBC', () => {
	it('looks up offsets using BC timezone rules', () => {
		const localeSpy = vi
			.spyOn(Date.prototype, 'toLocaleString')
			.mockImplementation(function (this: Date, _locale, _options) {
				return this.toISOString()
			})

		try {
			const result = adjustUtcForBC('2025-08-14T00:00:00.000Z')

			expect(localeSpy).toHaveBeenCalledWith('en-US', {
				timeZone: 'America/Vancouver',
			})
			expect(result.toISOString()).toBe('2025-08-14T00:00:00.000Z')
		} finally {
			localeSpy.mockRestore()
		}
	})
})
