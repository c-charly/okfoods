import { expect, test } from '@playwright/test'

/**
 * Tests de fumée (mobile 360 px et desktop 1440 px, voir playwright.config.ts).
 * Lancer d'abord le site : `docker compose up --build -d`, puis `pnpm test:e2e`.
 */
const PAGES = ['/', '/produits', '/recette', '/nous-trouver', '/team-bleue', '/ils-en-parlent', '/contact', '/en']

for (const path of PAGES) {
  test(`${path} : un seul h1, pas de scroll horizontal, aucune erreur console`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(path)
    await expect(page.locator('h1')).toHaveCount(1)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
  })
}

test('" Réduire les animations " est accessible et mémorisé', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: /Réduire les animations/ })
    .first()
    .click()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'static')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'static')
})

test('produits : croquer 3 fois puis " Remanger "', async ({ page }) => {
  await page.goto('/produits')
  const first = page.locator('[data-slug]').first()
  await first.scrollIntoViewIfNeeded()
  const bite = first.getByRole('button', { name: 'Croque-moi' })
  for (let i = 0; i < 3; i++) await bite.click()
  await expect(first.getByRole('button', { name: 'Remanger' })).toBeVisible()
})

test('contact : le formulaire classique est toujours disponible', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.getByLabel('Nom')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Envoyer' })).toBeVisible()
})

test("le commutateur de langue bascule vers l'anglais puis revient", async ({ page }) => {
  await page.goto('/')
  const sw = page.locator('header .lang-switch')
  await expect(sw).toHaveCount(1)
  await sw.click()
  await expect(page).toHaveURL(/\/en\/?$/)
  await page.locator('header .lang-switch').click()
  await expect(page).toHaveURL(/\/$/)
})

test('la navigation ne contient plus de bouton partenaire et ses liens tiennent sur une ligne (desktop)', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'barre haute desktop uniquement')
  await page.goto('/')
  await expect(page.locator('header').getByText(/partenaire/i)).toHaveCount(0)
  const heights = await page
    .locator('header nav a')
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
  expect(Math.max(...heights)).toBeLessThan(50)
})
