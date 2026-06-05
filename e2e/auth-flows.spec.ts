import { expect, test } from '@playwright/test'

test('login shows API error message for invalid credentials', async ({ page }) => {
  let submittedBody: unknown

  await page.route('**/api/auth/login', async (route) => {
    submittedBody = route.request().postDataJSON()
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Invalid email or password' }),
    })
  })

  await page.goto('/login')

  const result = await page.evaluate(async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'person@example.com', password: 'wrong-password' }),
    })

    return {
      status: res.status,
      json: (await res.json()) as { error?: string },
    }
  })

  expect(result.status).toBe(401)
  expect(result.json.error).toBe('Invalid email or password')
  await expect(page).toHaveURL(/\/login$/)

  await expect.poll(() => submittedBody).toEqual({
    email: 'person@example.com',
    password: 'wrong-password',
  })
})

test('signup sends required payload and surfaces API conflict message', async ({ page }) => {
  let submittedBody: unknown

  await page.route('**/api/auth/signup', async (route) => {
    submittedBody = route.request().postDataJSON()
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Username is already taken' }),
    })
  })

  await page.goto('/signup')

  const result = await page.evaluate(async () => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
      }),
    })

    return {
      status: res.status,
      json: (await res.json()) as { error?: string },
    }
  })

  expect(result.status).toBe(409)
  expect(result.json.error).toBe('Username is already taken')
  await expect(page).toHaveURL(/\/signup$/)

  await expect.poll(() => submittedBody).toEqual({
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
  })
})
