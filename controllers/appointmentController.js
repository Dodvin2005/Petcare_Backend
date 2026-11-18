const mongoose = require('mongoose')

const Appointment = require('../Models/appointmentModel')
const Pet = require('../Models/petModel')
const User = require('../Models/userModel')


// ========================================
// BOOK APPOINTMENT
// ========================================

exports.bookAppointmentController = async (req, res) => {

    console.log('Inside bookAppointmentController')

    try {

        // Get logged-in user ID
        const userId = req.userId

        const {
            petId,
            service,
            veterinarianId,
            appointmentType,
            appointmentDate,
            appointmentTime,
            concern
        } = req.body


        // Check required fields
        if (
            !petId ||
            !service ||
            !appointmentDate ||
            !appointmentTime
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide all required details'
            })

        }


        // Validate Pet ID
        if (!mongoose.Types.ObjectId.isValid(petId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid pet ID'
            })

        }


        // ========================================
        // CHECK PET OWNERSHIP
        // ========================================

        // IMPORTANT:
        // Pet model uses "owner", not "ownerId"

        const pet = await Pet.findOne({
            _id: petId,
            owner: userId
        })


        if (!pet) {

            return res.status(404).json({
                success: false,
                message: 'Pet not found or does not belong to you'
            })

        }


        // ========================================
        // VALIDATE VETERINARIAN
        // ========================================

        if (veterinarianId) {

            if (!mongoose.Types.ObjectId.isValid(veterinarianId)) {

                return res.status(400).json({
                    success: false,
                    message: 'Invalid veterinarian ID'
                })

            }


            const veterinarian = await User.findOne({
                _id: veterinarianId,
                role: 'veterinarian'
            })


            if (!veterinarian) {

                return res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                })

            }

        }


        // ========================================
        // VALIDATE APPOINTMENT DATE
        // ========================================

        const selectedDate = new Date(appointmentDate)

        if (
            isNaN(selectedDate.getTime()) ||
            selectedDate <= new Date()
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please select a future appointment date'
            })

        }


        // ========================================
        // CHECK APPOINTMENT TYPE
        // ========================================

        const allowedTypes = [
            'Clinic Visit',
            'Online Consultation',
            'Home Visit'
        ]

        const selectedType = appointmentType || 'Clinic Visit'

        if (!allowedTypes.includes(selectedType)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid appointment type'
            })

        }


        // ========================================
        // CHECK EXISTING APPOINTMENT SLOT
        // ========================================

        const existingAppointment = await Appointment.findOne({

            veterinarianId: veterinarianId || null,

            appointmentDate: selectedDate,

            appointmentTime,

            status: {
                $in: ['Pending', 'Confirmed']
            }

        })


        if (existingAppointment) {

            return res.status(409).json({
                success: false,
                message: 'This veterinarian already has an appointment at this time'
            })

        }


        // ========================================
        // CREATE NEW APPOINTMENT
        // ========================================

        const newAppointment = new Appointment({

            userId: userId,

            petId: petId,

            service: service,

            veterinarianId: veterinarianId || null,

            appointmentType: selectedType,

            appointmentDate: selectedDate,

            appointmentTime: appointmentTime,

            concern: concern || '',

            status: 'Pending'

        })


        await newAppointment.save()


        return res.status(201).json({

            success: true,

            message: 'Appointment booked successfully',

            appointment: newAppointment

        })


    } catch (error) {

        console.log('Appointment Booking Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to book appointment',

            error: error.message

        })

    }

}



// ========================================
// GET MY APPOINTMENTS
// ========================================

exports.getMyAppointmentsController = async (req, res) => {

    console.log('Inside getMyAppointmentsController')

    try {

        const userId = req.userId


        const appointments = await Appointment.find({

            userId: userId

        })

        .populate('petId')

        .populate('veterinarianId', 'name email phone')

        .sort({ createdAt: -1 })


        return res.status(200).json({

            success: true,

            message: 'Appointments fetched successfully',

            appointments

        })


    } catch (error) {

        console.log('Get Appointments Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to fetch appointments',

            error: error.message

        })

    }

}



// ========================================
// GET SINGLE APPOINTMENT
// ========================================

exports.getAppointmentController = async (req, res) => {

    console.log('Inside getAppointmentController')

    try {

        const userId = req.userId

        const { id } = req.params


        // Validate Appointment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: 'Invalid appointment ID'

            })

        }


        const appointment = await Appointment.findOne({

            _id: id,

            userId: userId

        })

        .populate('petId')

        .populate('veterinarianId', 'name email phone')


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: 'Appointment not found'

            })

        }


        return res.status(200).json({

            success: true,

            message: 'Appointment fetched successfully',

            appointment

        })


    } catch (error) {

        console.log('Get Single Appointment Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to fetch appointment',

            error: error.message

        })

    }

}



// ========================================
// CANCEL APPOINTMENT
// ========================================

exports.cancelAppointmentController = async (req, res) => {

    console.log('Inside cancelAppointmentController')

    try {

        const userId = req.userId

        const { id } = req.params


        // Validate Appointment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: 'Invalid appointment ID'

            })

        }


        const appointment = await Appointment.findOne({

            _id: id,

            userId: userId

        })


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: 'Appointment not found'

            })

        }


        // Check Appointment Status
        if (
            appointment.status === 'Completed' ||
            appointment.status === 'Cancelled' ||
            appointment.status === 'Rejected'
        ) {

            return res.status(400).json({

                success: false,

                message: 'This appointment cannot be cancelled'

            })

        }


        // Update Status
        appointment.status = 'Cancelled'

        await appointment.save()


        return res.status(200).json({

            success: true,

            message: 'Appointment cancelled successfully',

            appointment

        })


    } catch (error) {

        console.log('Cancel Appointment Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to cancel appointment',

            error: error.message

        })

    }

}



// ========================================
// DELETE CANCELLED APPOINTMENT
// ========================================

exports.deleteAppointmentController = async (req, res) => {

    console.log('Inside deleteAppointmentController')

    try {

        const userId = req.userId

        const { id } = req.params


        // Validate Appointment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: 'Invalid appointment ID'

            })

        }


        const appointment = await Appointment.findOneAndDelete({

            _id: id,

            userId: userId,

            status: 'Cancelled'

        })


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: 'Cancelled appointment not found'

            })

        }


        return res.status(200).json({

            success: true,

            message: 'Appointment deleted successfully'

        })


    } catch (error) {

        console.log('Delete Appointment Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to delete appointment',

            error: error.message

        })

    }

}