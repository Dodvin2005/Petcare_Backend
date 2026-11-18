const mongoose = require('mongoose')

const medicalRecordSchema = new mongoose.Schema({

    // Pet Information
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pets',
        required: true
    },

    // Pet Owner
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Veterinarian
    veterinarianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Related Appointment
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    },

    // Record Type
    recordType: {
        type: String,
        enum: ['Consultation', 'Vaccination'],
        default: 'Consultation'
    },

    // Medical Information
    diagnosis: {
        type: String,
        default: ''
    },

    symptoms: {
        type: String,
        default: ''
    },

    treatment: {
        type: String,
        default: ''
    },

    prescription: {
        type: String,
        default: ''
    },

    // Vaccination Information
    vaccineName: {
        type: String,
        default: ''
    },

    vaccinationDate: {
        type: Date,
        default: null
    },

    nextVaccinationDate: {
        type: Date,
        default: null
    },

    // Additional Information
    notes: {
        type: String,
        default: ''
    },

    followUpDate: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
})


// Create Medical Record Model
const MedicalRecord = mongoose.model(
    'MedicalRecord',
    medicalRecordSchema
)

module.exports = MedicalRecord