const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory')

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()
        const customPage = new CustomPage(page)
        return new Proxy(customPage, {
            get(target, propertyKey) {
                return customPage[propertyKey] || browser[propertyKey] || page[propertyKey]
            }
        })
    }

    constructor(page) {
        this.page = page
    }

    async login() {
        const user = await userFactory()
        const {sessionString, sessionSignature} = sessionFactory(user)
        await this.page.setCookie({name: 'session', value: sessionString})
        await this.page.setCookie({name: 'session.sig', value: sessionSignature})
        await this.page.goto('http://localhost:3000/blogs')
    }

    getInnerHTML(selector) {
        return this.page.$eval(selector, el => el.innerHTML)
    }
}

module.exports = CustomPage
