const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({

    // Service Name
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    // Service Category
    category: {
        type: String,
        required: true,
        trim: true
    },

    // Service Price
    price: {
        type: Number,
        required: true,
        min: 0
    },

    // Service Duration
    duration: {
        type: String,
        required: true
    },

    // Service Description
    description: {
        type: String,
        required: true
    },

    // Service Status
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },

    // Service Icon
    icon: {
        type: String,
        default: '🐾'
    }

}, {
    timestamps: true
})

const Service = mongoose.model('Service', serviceSchema)

module.exports = Service