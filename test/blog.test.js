const Page = require('./helpers/page')

let page

beforeEach(async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
})

describe('when logged in', () => {
    beforeEach(async () => {
        await page.login()
        await page.click('a.btn-floating')
    })
    test('should have blog creation form', async () => {
        const blogTitleText = await page.getInnerHTML('form label')
        expect(blogTitleText).toEqual('Blog Title')
    })
    describe('when valid input values entered', () => {
        beforeEach(async () => {
            await page.type('.title input', 'My Title')
            await page.type('.content input', 'My Content')
            await page.click('form button')
        })
        test('should go to review screen', async () => {
            const confirmationText = await page.getInnerHTML('form h5')
            expect(confirmationText).toEqual('Please confirm your entries')
        })
        test('should be able to save new blog', async () => {
            await page.click('button.green')
            await page.waitFor('.card')
            const blogTitle = await page.getInnerHTML('.card-title')
            const blogContent = await page.getInnerHTML('p')
            expect(blogTitle).toEqual('My Title')
            expect(blogContent).toEqual('My Content')
        })
    })
    describe('when invalid input values entered', () => {
        beforeEach(async () => {
            await page.click('form button')
        })
        test('should show input error messages', async () => {
            const titleErrorText = await page.getInnerHTML('.title .red-text')
            const contentErrorText = await page.getInnerHTML('.content .red-text')
            expect(titleErrorText).toEqual('You must provide a value')
            expect(contentErrorText).toEqual('You must provide a value')
        })
    })
})

describe('when user is not logged in', () => {
    test('should not be able to create new blog', async () => {
        const result = await page.evaluate(() => fetch('/api/blogs',
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        title: 'My Fetch Title',
                        content: 'My Fetch Content'
                    }
                )
            }).then(res => res.json()))
        expect(result).toEqual({ error: 'You must log in!' })
    })
    test('should not be able to get list of blogs', async () => {
        const result = await page.evaluate(() => fetch('/api/blogs',
            {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()))
        expect(result).toEqual({error: 'You must log in!'})
    })
})