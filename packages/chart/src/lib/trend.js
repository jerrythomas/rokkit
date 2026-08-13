export function mean(ys) {
	if (!ys.length) return null
	return ys.reduce((s, v) => s + v, 0) / ys.length
}

export function median(ys) {
	if (!ys.length) return null
	const sorted = [...ys].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** Least-squares line. Returns { m, b } or null (< 2 points or zero x-variance). */
export function linearRegression(xs, ys) {
	const n = xs.length
	if (n < 2) return null
	const mx = mean(xs)
	const my = mean(ys)
	let num = 0
	let den = 0
	for (let i = 0; i < n; i++) {
		const dx = xs[i] - mx
		num += dx * (ys[i] - my)
		den += dx * dx
	}
	if (den === 0) return null
	const m = num / den
	return { m, b: my - m * mx }
}

/** Trailing simple moving average; length preserved (partial window at the head). */
export function movingAverage(ys, window) {
	const w = Math.max(1, Math.floor(window))
	const out = []
	for (let i = 0; i < ys.length; i++) {
		const start = Math.max(0, i - w + 1)
		const slice = ys.slice(start, i + 1)
		out.push(slice.reduce((s, v) => s + v, 0) / slice.length)
	}
	return out
}

/** Exponential moving average; alpha = alpha ?? 2/(span+1). Length preserved. */
export function ema(ys, { span, alpha } = {}) {
	if (!ys.length) return []
	const a = alpha ?? 2 / ((span ?? 7) + 1)
	const out = [ys[0]]
	for (let i = 1; i < ys.length; i++) out.push(a * ys[i] + (1 - a) * out[i - 1])
	return out
}

/** Fit y = a·e^(bx) via log-linear least squares. Null if any y ≤ 0 or < 2 points. */
export function expRegression(xs, ys) {
	if (xs.length < 2) return null
	if (ys.some((v) => v <= 0)) return null
	const reg = linearRegression(xs, ys.map((v) => Math.log(v)))
	if (!reg) return null
	return { a: Math.exp(reg.b), b: reg.m }
}

function normalize(method) {
	if (typeof method === 'number') return { type: 'value', value: method }
	if (typeof method === 'string') return { type: method === 'mean' ? 'avg' : method }
	if (method && typeof method === 'object' && method.type)
		return { ...method, type: method.type === 'mean' ? 'avg' : method.type }
	return null
}

/**
 * Compute a trend for `rows` on channels {x, y}.
 * @returns {{kind:'constant', value:number} | {kind:'series', values:number[]} | null}
 */
export function computeTrend(rows, channels, method) {
	const cfg = normalize(method)
	if (!cfg || !Array.isArray(rows) || rows.length === 0) return null
	const { x, y } = channels
	const ys = rows.map((r) => Number(r[y]))
	const xs = rows.map((r, i) => {
		const v = Number(r[x])
		return Number.isFinite(v) ? v : i
	})

	switch (cfg.type) {
		case 'avg':
			return { kind: 'constant', value: mean(ys) }
		case 'median':
			return { kind: 'constant', value: median(ys) }
		case 'min':
			return { kind: 'constant', value: Math.min(...ys) }
		case 'max':
			return { kind: 'constant', value: Math.max(...ys) }
		case 'value':
			return typeof cfg.value === 'number' ? { kind: 'constant', value: cfg.value } : null
		case 'linear': {
			const reg = linearRegression(xs, ys)
			if (!reg) return null
			return { kind: 'series', values: xs.map((v) => reg.m * v + reg.b) }
		}
		case 'ma': {
			if (!cfg.window) return null
			return { kind: 'series', values: movingAverage(ys, cfg.window) }
		}
		case 'ema':
			return { kind: 'series', values: ema(ys, { span: cfg.span, alpha: cfg.alpha }) }
		case 'exp': {
			const reg = expRegression(xs, ys)
			if (!reg) return null
			return { kind: 'series', values: xs.map((v) => reg.a * Math.exp(reg.b * v)) }
		}
		default:
			return null
	}
}
