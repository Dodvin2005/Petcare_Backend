const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({

    // Logged-in User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Related Appointment
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },

    // Payment Amount
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    // Payment Method
    paymentMethod: {
        type: String,
        enum: [
            'UPI',
            'Credit Card',
            'Debit Card'
        ],
        required: true
    },

    // Transaction ID
    transactionId: {
        type: String,
        required: true,
        unique: true
    },

    // Payment Status
    paymentStatus: {
        type: String,
        enum: [
            'Pending',
            'Success',
            'Failed'
        ],
        default: 'Pending'
    },

    // Payment Date
    paidAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
})


// Create Payment Model
const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment