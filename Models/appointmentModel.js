const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({

    // Pet Owner
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Selected Pet
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pets',
        required: true
    },

    // Veterinary Service
    // Dynamic service names are allowed
    service: {
        type: String,
        required: true,
        trim: true
    },

    // Selected Veterinarian
    veterinarianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Appointment Type
    appointmentType: {
        type: String,
        enum: [
            'Clinic Visit',
            'Online Consultation',
            'Home Visit'
        ],
        default: 'Clinic Visit'
    },

    // Appointment Date
    appointmentDate: {
        type: Date,
        required: true
    },

    // Appointment Time
    appointmentTime: {
        type: String,
        required: true
    },

    // Pet Health Concern
    concern: {
        type: String,
        default: ''
    },

    // Appointment Status
    status: {
        type: String,
        enum: [
            'Pending',
            'Confirmed',
            'Completed',
            'Cancelled',
            'Rejected'
        ],
        default: 'Pending'
    }

}, {
    timestamps: true
})


// Create Appointment Model
const Appointment = mongoose.model('Appointment', appointmentSchema)

module.exports = Appointment