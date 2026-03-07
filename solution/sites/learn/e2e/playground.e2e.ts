/**
 * Playground page coverage tests — every playground page must:
 *   1. Load without error
 *   2. Show the playground content area
 *   3. Show the sidebar navigation
 */
import { test, expect } from '@playwright/test'

const PLAYGROUND_COMPONENTS = [
  'breadcrumbs',
  'button',
  'card',
  'carousel',
  'code',
  'floating-action',
  'floating-navigation',
  'forms',
  'lazy-tree',
  'list',
  'menu',
  'multi-select',
  'palette-manager',
  'pill',
  'progress',
  'range',
  'rating',
  'select',
  'stepper',
  'switch',
  'table',
  'tabs',
  'timeline',
  'toggle',
  'tree',
  'upload-progress',
  'upload-target'
]

async function checkPlaygroundPage(page: any, slug: string) {
  await page.goto(`/playground/components/${slug}`)
  await page.waitForLoadState('networkidle')

  // Playground content area must be present
  await expect(page.locator('[data-playground-content]')).toBeVisible()

  // Sidebar must be rendered with nav groups
  const sidebar = page.locator('aside').first()
  await expect(sidebar).toBeVisible()
  const navList = sidebar.locator('[data-list]')
  await expect(navList).toBeVisible()
}

test.describe('Playground home', () => {
  test('shows grouped sections', async ({ page }) => {
    await page.goto('/playground')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Navigation & Selection')).toBeVisible()
    await expect(page.locator('text=Inputs')).toBeVisible()
    await expect(page.locator('text=Display')).toBeVisible()
    await expect(page.locator('text=Layout')).toBeVisible()
  })
})

test.describe('Playground component pages', () => {
  for (const slug of PLAYGROUND_COMPONENTS) {
    test(`/playground/components/${slug} loads`, async ({ page }) => {
      await checkPlaygroundPage(page, slug)
    })
  }
})
