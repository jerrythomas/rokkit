import { describe, it, expect } from 'vitest'
import { readPath } from '../src/model/path.js'

describe('readPath', () => {
	it('reads a top-level key', () => {
		expect(readPath({ name: 'users' }, 'name')).toBe('users')
	})

	it('reads a dotted path — dbd refs nest as { from: { s, t, c } }', () => {
		expect(readPath({ from: { s: 'public', t: 'users', c: 'id' } }, 'from.t')).toBe('users')
	})

	it('returns undefined for a missing leaf rather than throwing', () => {
		expect(readPath({ from: { s: 'public' } }, 'from.t')).toBeUndefined()
	})

	it('returns undefined when an intermediate segment is absent', () => {
		expect(readPath({}, 'from.t')).toBeUndefined()
	})

	it('returns undefined when an intermediate segment is not an object', () => {
		expect(readPath({ from: 'public' }, 'from.t')).toBeUndefined()
	})

	it('returns undefined when the row itself is null', () => {
		expect(readPath(null, 'name')).toBeUndefined()
	})

	it('reads OWN properties only — an inherited key is not a field', () => {
		// Field maps come from the consumer and rows come from their data, so a map naming
		// `constructor` or `toString` must read as "absent", not as a builtin. Walking the
		// prototype chain would resolve `constructor.name` to 'Object' and hand a layout a
		// label no row actually carries.
		expect(readPath({}, 'constructor')).toBeUndefined()
		expect(readPath({}, 'constructor.name')).toBeUndefined()
		expect(readPath({}, 'toString')).toBeUndefined()
		expect(readPath({}, '__proto__')).toBeUndefined()

		// An own property that merely shares a builtin's name still reads normally.
		expect(readPath({ name: 'users' }, 'name')).toBe('users')
	})

	it('does not treat an array index as a path segment', () => {
		// Field maps name object paths, never array positions — `rows.0` is not a
		// contract we support, and silently reading it would invite maps that break
		// as soon as the data reorders.
		expect(readPath({ rows: [{ name: 'id' }] }, 'rows.0.name')).toBeUndefined()
	})
})
