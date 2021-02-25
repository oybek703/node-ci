const Page = require('../test/helpers/page')

let page

beforeEach(async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
})

test('should launch chromium browser and get header text.', async () => {
    const logoText = await page.getInnerHTML('a.brand-logo')
    expect(logoText).toEqual('Blogster')
})
test('should start google OAuth flow.', async () => {
    await page.click('ul.right a')
    const url = await page.url()
    expect(url).toMatch(/accounts\.google\.com/)
})
test('should have logout route for logged in users.', async () => {
    await page.login()
    await page.goto('http://localhost:3000')
    // await page.waitFor('a[href="/auth/logout"]')
    const logoutBtnText = await page.getInnerHTML('a[href="/auth/logout"]')
    expect(logoutBtnText).toEqual('Logout')
})