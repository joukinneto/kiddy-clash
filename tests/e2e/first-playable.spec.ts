import { mkdir } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

type QaState = {
  sceneReady: boolean
  playerX: number
  playerY: number
  velocityX: number
  velocityY: number
  grounded: boolean
  stars: number
  checkpoint: number
  position: number
  progress: number
  abilityReadyAt: number
  finished: boolean
  lastEvent: string
}

async function qaState(page: import('@playwright/test').Page) {
  return page.evaluate(() => window.__KIDDY_QA__ as QaState)
}

test('menu supports PT/EN and starts VS Computer gameplay', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/?qa=1')
  await expect(page.getByAltText('Kiddy Clash')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Contra o Computador' })).toBeVisible()

  await page.getByRole('button', { name: '🇺🇸 EN' }).click()
  await expect(page.getByRole('heading', { name: 'VS Computer' })).toBeVisible()

  await page.getByRole('button', { name: /Play now/i }).click()
  await expect(page.locator('canvas')).toBeVisible()

  await page.waitForFunction(() => window.__KIDDY_QA__?.sceneReady === true)
  expect((await qaState(page)).finished).toBe(false)
  expect(pageErrors).toEqual([])
})

test('keyboard moves Leo, jumps and activates Super Jump', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop')

  await page.goto('/?qa=1')
  await page.getByRole('button', { name: /Jogar agora/i }).click()
  await page.waitForFunction(() => window.__KIDDY_QA__?.sceneReady === true)
  await page.waitForFunction(() => window.__KIDDY_QA__?.grounded === true)

  const start = await qaState(page)

  await page.keyboard.down('ArrowRight')
  await page.waitForTimeout(650)
  await page.keyboard.up('ArrowRight')

  const moved = await qaState(page)
  expect(moved.playerX).toBeGreaterThan(start.playerX + 20)
  expect(moved.progress).toBeGreaterThan(start.progress)

  await page.waitForFunction(() => window.__KIDDY_QA__?.grounded === true)
  await page.keyboard.press('Space')
  await page.waitForFunction(() => window.__KIDDY_QA__?.lastEvent === 'jump')

  const jumped = await qaState(page)
  expect(jumped.velocityY).toBeLessThan(0)

  await page.waitForFunction(() => window.__KIDDY_QA__?.grounded === true)
  await page.keyboard.press('Shift')
  await page.waitForFunction(() => window.__KIDDY_QA__?.lastEvent === 'leo-super-jump')

  const superJumped = await qaState(page)
  expect(superJumped.velocityY).toBeLessThan(0)
  expect(superJumped.abilityReadyAt).toBeGreaterThan(0)
})

test('mobile landscape touch controls move and jump', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-mobile-landscape')

  await page.goto('/?qa=1')
  await page.getByRole('button', { name: /Jogar agora/i }).click()
  await page.waitForFunction(() => window.__KIDDY_QA__?.sceneReady === true)
  await page.waitForFunction(() => window.__KIDDY_QA__?.grounded === true)

  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  const rightX = box.x + (185 / 1280) * box.width
  const controlsY = box.y + (625 / 720) * box.height
  const jumpX = box.x + (1140 / 1280) * box.width

  const start = await qaState(page)

  await page.mouse.move(rightX, controlsY)
  await page.mouse.down()
  await page.waitForTimeout(700)
  await page.mouse.up()

  const moved = await qaState(page)
  expect(moved.playerX).toBeGreaterThan(start.playerX + 15)

  await page.waitForFunction(() => window.__KIDDY_QA__?.grounded === true)
  await page.mouse.click(jumpX, controlsY)
  await page.waitForFunction(() => window.__KIDDY_QA__?.lastEvent === 'jump')

  const jumped = await qaState(page)
  expect(jumped.velocityY).toBeLessThan(0)
})

test('capture rendered visual QA evidence', async ({ page }, testInfo) => {
  await mkdir('qa-screenshots', { recursive: true })

  await page.goto('/?qa=1')
  await expect(page.getByAltText('Kiddy Clash')).toBeVisible()
  await page.screenshot({
    path: `qa-screenshots/${testInfo.project.name}-home.png`,
    fullPage: true,
  })

  await page.getByRole('button', { name: /Jogar agora/i }).click()
  await page.waitForFunction(() => window.__KIDDY_QA__?.sceneReady === true)
  await page.waitForTimeout(350)

  await page.screenshot({
    path: `qa-screenshots/${testInfo.project.name}-gameplay.png`,
    fullPage: true,
  })
})
