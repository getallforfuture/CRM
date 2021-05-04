const moment = require('moment')
const Order = require('../models/Order')
const errorHandler = require("../utils/errorHandler")

module.exports.overview = async (req, res) => {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: -1})
        const ordersMap = await getOrdersMap(allOrders)
        const yesterdayOrders = await ordersMap[moment().add(-1, 'day').format('DD.MM.YYYY')]


        //yesterday orders quantity

        const yesterdayOrdersQuantity = yesterdayOrders ? yesterdayOrders.length : 0

        //orders quantity
        const ordersQuantity = allOrders.length

        //days quantity
        const daysQuantity = Object.keys(ordersMap).length

        //orders per day
        const ordersPerDay = (ordersQuantity / daysQuantity).toFixed(0)

        //percent for orders quantity
        const ordersPercent = (((yesterdayOrdersQuantity / ordersPerDay) - 1) * 100).toFixed(2)

        //total revenues(gain)
        const totalGain = calculatePrice(allOrders)

        //day gain
        const gainPerDay = totalGain / daysQuantity// not right

        //yesterdayGain
        const yesterdayGain = calculatePrice(yesterdayOrders)
        //Gain percent
        const gainPercent = (((yesterdayGain / gainPerDay) - 1) * 100).toFixed(2)

        //gain comparison
        const compareGain = (yesterdayGain - gainPerDay).toFixed(2)

        //OrdersQuantity comparison
        const compareOrdersQuantity = (yesterdayOrdersQuantity - ordersPerDay).toFixed(2)

        res.status(200).json({
            gain: {
                percent: Math.abs(+gainPercent),
                compare: Math.abs(+compareGain),
                yesterday: +yesterdayGain,
                isHigher: gainPercent > 0
            },
            orders: {
                percent: Math.abs(+ordersPercent),
                compare: Math.abs(+compareOrdersQuantity),
                yesterday: +yesterdayOrdersQuantity,
                isHigher: ordersPercent > 0
            }
        })

    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.analytics = async (req, res) => {
    try {
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
        const ordersMap = getOrdersMap(allOrders)

        const average = +(calculatePrice(allOrders) / Object.keys(ordersMap).length).toFixed(2)

        const chart = Object.keys(ordersMap).map(label => {

            const order = ordersMap[label].length
            const gain = calculatePrice(ordersMap[label])

            return {label, order, gain}
        })

        res.status(200).json({
            average, chart
        })

    } catch (e) {
        errorHandler(res, e)
    }
}

function getOrdersMap(orders = []) {
    const daysOrders = {}

    orders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYYY')

        if (date === moment().format('DD.MM.YYYY')) {
            return
        }

        if (!daysOrders[date]) {
            daysOrders[date] = []
        }

        daysOrders[date].push(order)
    })

    return daysOrders
}

function calculatePrice(orders = []) {
    return orders.reduce((total, order) => {
        const orderPrice = order.list.reduce((orderTotal, item) => {
            return orderTotal += item.cost * item.quantity
        }, 0)
        return total += orderPrice
    }, 0)

}