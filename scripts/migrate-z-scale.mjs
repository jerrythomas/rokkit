#!/usr/bin/env bun
// THROWAWAY codemod: rewrite legacy z-tone utilities + --color-{role}-z{n} vars
// to the named-token vocabulary. Excludes secondary/tertiary (no named equivalent).
//   bun scripts/migrate-z-scale.mjs apps/learn/src
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SURFACE = ['paper','paper-soft','paper-mute','paper-mute','paper-edge','ink-soft','ink-soft','ink-mute','ink-mute','ink','ink']
const INK     = ['ink','ink-mute','ink-mute','ink-soft','ink-soft','paper-edge','paper-edge','paper-mute','paper-mute','paper-soft','paper']
const STATUS  = ['accent','success','warning','danger','error','info'] // have -soft

function tokenFor(role, n) {
	if (role === 'surface') return SURFACE[n]
	if (role === 'ink') return INK[n]
	if (role === 'primary') return 'primary'         // no -soft companion
	if (STATUS.includes(role)) return n <= 2 ? `${role}-soft` : role
	return null                                       // secondary/tertiary → manual
}

const ROLES = ['surface','ink','primary','accent','success','warning','danger','error','info']
const ROLE_RE = ROLES.join('|')
const PREFIXES = ['bg','text','border','border-t','border-b','border-l','border-r','ring','outline','fill','stroke','divide','from','to']
const UTIL_RE = new RegExp(`\\b(${PREFIXES.join('|')})-(${ROLE_RE})-z(\\d{1,2})\\b`, 'g')
const VAR_RE = new RegExp(`--color-(${ROLE_RE})-z(\\d{1,2})\\b`, 'g')

function transform(src) {
	let out = src.replace(UTIL_RE, (m, prefix, role, num) => {
		const n = parseInt(num, 10)
		const t = n >= 0 && n <= 10 ? tokenFor(role, n) : null
		return t ? `${prefix}-${t}` : m
	})
	out = out.replace(VAR_RE, (m, role, num) => {
		const n = parseInt(num, 10)
		const t = n >= 0 && n <= 10 ? tokenFor(role, n) : null
		return t ? `--${t}` : m
	})
	return out
}

const EXTS = ['.svelte','.ts','.js','.css','.svx','.md']
function walk(dir, files = []) {
	for (const entry of readdirSync(dir)) {
		if (entry === 'node_modules' || entry === 'dist' || entry === '.svelte-kit') continue
		const p = join(dir, entry)
		if (statSync(p).isDirectory()) walk(p, files)
		else if (EXTS.some((e) => p.endsWith(e))) files.push(p)
	}
	return files
}

const target = process.argv[2]
if (!target) { console.error('usage: bun scripts/migrate-z-scale.mjs <dir>'); process.exit(1) }
let changed = 0
for (const file of walk(target)) {
	const src = readFileSync(file, 'utf8')
	const out = transform(src)
	if (out !== src) { writeFileSync(file, out); changed++; console.log('rewrote', file) }
}
console.log(`done — ${changed} file(s) changed`)
