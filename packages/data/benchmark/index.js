#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * @rokkit/data benchmark entry point
 *
 * Usage:
 *   bun benchmark/index.js              # print results to console
 *   bun benchmark/index.js --save       # also write benchmark/results/<phase>.json
 *   bun benchmark/index.js --phase p2   # label results with a phase name
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { runBenchmarks } from './runner.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

const phaseFlag = args.indexOf('--phase')
const phase = phaseFlag !== -1 ? args[phaseFlag + 1] : 'baseline'
const save = args.includes('--save')

console.log(`\n@rokkit/data benchmark  [phase: ${phase}]`)
console.log('─'.repeat(50))

const results = runBenchmarks(phase)

console.log(`\n${'─'.repeat(50)}`)
console.log(`Completed ${results.results.length} benchmarks at ${results.timestamp}`)

if (save) {
	const outDir = join(__dir, 'results')
	mkdirSync(outDir, { recursive: true })
	const filename = join(outDir, `${phase}.json`)
	writeFileSync(filename, JSON.stringify(results, null, 2))
	console.log(`Results saved to benchmark/results/${phase}.json`)
}
