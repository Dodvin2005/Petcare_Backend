const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    // BASIC INFORMATION

    name: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    phone: {
        type: String,
        default: ''
    },

    address: {
        type: String,
        default: ''
    },

    profileImage: {
        type: String,
        default: ''
    },


    // USER ROLE

    role: {
        type: String,
        enum: ['user', 'admin', 'veterinarian'],
        default: 'user'
    },


    // VETERINARIAN PROFESSIONAL DETAILS

    specialization: {
        type: String,
        default: ''
    },

    qualification: {
        type: String,
        default: ''
    },

    experience: {
        type: String,
        default: ''
    },

    license: {
        type: String,
        default: ''
    },

    about: {
        type: String,
        default: ''
    },


    // VETERINARIAN AVAILABILITY

    availability: {
        type: String,
        enum: ['Available', 'Unavailable'],
        default: 'Available'
    },


    // ACCOUNT STATUS

    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }

}, {

    timestamps: true

})


const User = mongoose.model('User', userSchema)

module.exports = User