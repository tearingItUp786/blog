export function serializeJsonForInlineScript(value: unknown) {
	return (JSON.stringify(value) ?? 'undefined').replace(/</g, '\\u003c')
}
