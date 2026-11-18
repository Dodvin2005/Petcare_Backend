const mongoose = require('mongoose')

const Payment = require('../Models/paymentModel')
const Appointment = require('../Models/appointmentModel')
const Service = require('../Models/serviceModel')


// CREATE DUMMY PAYMENT

exports.createPaymentController = async (req, res) => {

    try {

        const userId = req.userId

        const { appointmentId, paymentMethod } = req.body


        // Check Required Fields

        if (!appointmentId || !paymentMethod) {

            return res.status(400).json({
                success: false,
                message: 'Appointment ID and payment method are required'
            })

        }


        // Validate Appointment ID

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid appointment ID'
            })

        }


        // Validate Payment Method

        const allowedMethods = [
            'UPI',
            'Credit Card',
            'Debit Card'
        ]

        if (!allowedMethods.includes(paymentMethod)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            })

        }


        // FIND APPOINTMENT

        const appointment = await Appointment.findOne({

            _id: appointmentId,
            userId: userId

        })


        if (!appointment) {

            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            })

        }


        // CHECK APPOINTMENT STATUS

        if (
            appointment.status === 'Cancelled' ||
            appointment.status === 'Rejected' ||
            appointment.status === 'Completed'
        ) {

            return res.status(400).json({
                success: false,
                message: 'Payment is not allowed for this appointment'
            })

        }


        // CHECK EXISTING SUCCESSFUL PAYMENT

        const existingPayment = await Payment.findOne({

            appointmentId: appointmentId,
            paymentStatus: 'Success'

        })


        if (existingPayment) {

            return res.status(409).json({
                success: false,
                message: 'Payment already completed for this appointment',
                payment: existingPayment
            })

        }


        // FIND ACTIVE SERVICE

        const service = await Service.findOne({

            name: appointment.service,
            status: 'Active'

        })


        if (!service) {

            return res.status(404).json({
                success: false,
                message: 'Service not found or inactive'
            })

        }


        // Get Actual Service Price

        const amount = service.price


        // GENERATE TRANSACTION ID

        const transactionId =
            'PETCARE' +
            Date.now() +
            Math.floor(1000 + Math.random() * 9000)


        // SIMULATE PAYMENT RESULT
       

        // 80% Success
        // 20% Failure

        const isSuccessful = Math.random() < 0.8


        // CREATE PAYMENT

        const payment = new Payment({

            userId: userId,

            appointmentId: appointmentId,

            amount: amount,

            paymentMethod: paymentMethod,

            transactionId: transactionId,

            paymentStatus: isSuccessful ? 'Success' : 'Failed',

            paidAt: isSuccessful ? new Date() : null

        })


        await payment.save()


        // APPOINTMENT STATUS

        // IMPORTANT:
        // Payment success does not automatically
        // confirm the appointment.
        //
        // Appointment remains Pending.
        // Veterinarian will accept or reject it.


        // RESPONSE

        return res.status(201).json({

            success: isSuccessful,

            message: isSuccessful
                ? 'Payment completed successfully'
                : 'Payment failed. Please try again',

            payment: payment,

            appointmentStatus: appointment.status

        })


    } catch (error) {

        console.log('Dummy Payment Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Payment processing failed',

            error: error.message

        })

    }

}



// GET MY PAYMENT HISTORY

exports.getMyPaymentsController = async (req, res) => {

    try {

        const userId = req.userId


        const payments = await Payment.find({

            userId: userId

        })

        .populate('appointmentId')

        .sort({ createdAt: -1 })


        return res.status(200).json({

            success: true,

            message: 'Payment history fetched successfully',

            payments

        })


    } catch (error) {

        console.log('Payment History Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to fetch payment history',

            error: error.message

        })

    }

}



// GET SINGLE PAYMENT

exports.getSinglePaymentController = async (req, res) => {

    try {

        const userId = req.userId

        const { id } = req.params


        // Validate Payment ID

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: 'Invalid payment ID'

            })

        }


        const payment = await Payment.findOne({

            _id: id,

            userId: userId

        })

        .populate('appointmentId')


        if (!payment) {

            return res.status(404).json({

                success: false,

                message: 'Payment not found'

            })

        }


        return res.status(200).json({

            success: true,

            message: 'Payment details fetched successfully',

            payment

        })


    } catch (error) {

        console.log('Single Payment Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to fetch payment details',

            error: error.message

        })

    }

}