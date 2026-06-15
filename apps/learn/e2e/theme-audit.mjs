/**
 * Ad-hoc theme-contrast runner — audits the isolated /embed/gallery across the
 * full style × mode × skin matrix and prints a markdown report. Use against a
 * running dev/preview server:
 *
 *   AUDIT_BASE=http://localhost:5191 node e2e/theme-audit.mjs
 *
 * The committed regression gate is e2e/theme-contrast.e2e.ts (same collector).
 * This runner is for fast local iteration while fixing findings.
 */
import { chromium } from 'playwright'
import { auditGallery, formatReport } from './contrast-collector.mjs'

const BASE = process.env.AUDIT_BASE || 'http://localhost:5191'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const rows = await auditGallery(page, BASE)
await browser.close()
console.log(formatReport(rows, BASE))
