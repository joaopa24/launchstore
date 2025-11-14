const Product = require('../models/Product')
const { formatPrice, date } = require('../../lib/utils')

async function getImage(productId) {
    let files = await Product.files(productId)

    files = files.map(file => {
        let src = file.path
            .replace("public", "")   // remove 'public'
            .replace(/\\/g, "/")     // troca '\' por '/'
        
        // garante que sempre começa com /
        if (!src.startsWith("/")) {
            src = "/" + src
        }

        return {
            ...file,
            src
        }
    })

    return files
}

async function format(product) {
    const files = await getImage(product.id)

    product.img = files[0]?.src || null
    product.files = files
    product.formatedPrice = formatPrice(product.price)
    product.formatedOldPrice = formatPrice(product.old_price)

    const { day, hour, minutes, month } = date(product.updated_at)

    product.published = {
        day: `${day}/${month}`,
        hour: `${hour}:${minutes}`,
    }

    return product
}

const LoadService = {
    load(service, filter) {
        this.filter = filter
        return this[service]()
    },

    async product() {
        try {
            const product = await Product.findOne(this.filter)
            return format(product)
        } catch (err) {
            console.log(err)
        }
    },

    async products() {
        try {
            const products = await Product.findAll(this.filter)
            const productsPromise = products.map(format)
            return Promise.all(productsPromise)
        } catch (err) {
            console.error(err)
        }
    },

    format
}

module.exports = LoadService
