const mongoose = require('mongoose')

const petSchema = new mongoose.Schema({

    // Pet Owner
    owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},

    // Basic Information
    petName: {
        type: String,
        required: true,
        trim: true
    },

    petType: {
        type: String,
        required: true,
        enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']
    },

    breed: {
        type: String,
        default: ''
    },

    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female']
    },

    dateOfBirth: {
        type: Date,
        default: null
    },

    weight: {
        type: Number,
        default: null
    },

    colour: {
        type: String,
        default: ''
    },

    identificationNumber: {
        type: String,
        default: ''
    },

    // Pet Profile Picture
    petImage: {
        type: String,
        default: ''
    },

    // Health Information
    vaccinationStatus: {
        type: String,
        enum: [
            'Fully Vaccinated',
            'Partially Vaccinated',
            'Not Vaccinated',
            'Unknown'
        ],
        default: 'Unknown'
    },

    lastVaccinationDate: {
        type: Date,
        default: null
    },

    existingMedicalConditions: {
        type: String,
        default: ''
    },

    medicalHistory: {
        type: String,
        default: ''
    },

    // Additional Information
    neuteredOrSpayed: {
        type: String,
        enum: ['Yes', 'No', 'Not Sure'],
        default: 'Not Sure'
    },

    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },

    additionalNotes: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
})


// Create Pet Model
const pets = mongoose.model('pets', petSchema)

module.exports = pets