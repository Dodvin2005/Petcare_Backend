const mongoose = require('mongoose')

const Appointment = require('../Models/appointmentModel')
const Pet = require('../Models/petModel')
const User = require('../Models/userModel')
const MedicalRecord = require('../Models/medicalRecordModel')




exports.getVetDashboardController = async (req, res) => {

    try {

        const vetId = req.userId

        // Total assigned appointments
        const totalAppointments = await Appointment.countDocuments({
            veterinarianId: vetId
        })

        // Pending appointments
        const pendingAppointments = await Appointment.countDocuments({
            veterinarianId: vetId,
            status: 'Pending'
        })

        // Confirmed appointments
        const confirmedAppointments = await Appointment.countDocuments({
            veterinarianId: vetId,
            status: 'Confirmed'
        })

        // Completed appointments
        const completedAppointments = await Appointment.countDocuments({
            veterinarianId: vetId,
            status: 'Completed'
        })

        // Rejected appointments
        const rejectedAppointments = await Appointment.countDocuments({
            veterinarianId: vetId,
            status: 'Rejected'
        })

        // Total medical records created by veterinarian
        const totalMedicalRecords = await MedicalRecord.countDocuments({
            veterinarianId: vetId
        })

        // Assigned patients
        const appointments = await Appointment.find({
            veterinarianId: vetId
        }).select('petId')

        const uniquePetIds = [
            ...new Set(
                appointments.map(item => item.petId.toString())
            )
        ]

        res.status(200).json({

            message: 'Veterinarian dashboard loaded successfully',

            dashboard: {
                totalAppointments,
                pendingAppointments,
                confirmedAppointments,
                completedAppointments,
                rejectedAppointments,
                totalPatients: uniquePetIds.length,
                totalMedicalRecords
            }

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to load veterinarian dashboard',
            error: error.message
        })

    }

}





exports.getVetAppointmentsController = async (req, res) => {

    try {

        const vetId = req.userId

        const appointments = await Appointment.find({
            veterinarianId: vetId
        })
            .populate('petId')
            .populate('userId', 'name username email phone')
            .sort({ appointmentDate: 1 })

        res.status(200).json({

            message: 'Appointments fetched successfully',

            appointments

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to fetch appointments',
            error: error.message
        })

    }

}





exports.acceptAppointmentController = async (req, res) => {

    try {

        const vetId = req.userId

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                message: 'Invalid appointment ID'
            })

        }

        const appointment = await Appointment.findOne({
            _id: id,
            veterinarianId: vetId
        })

        if (!appointment) {

            return res.status(404).json({
                message: 'Appointment not found or not assigned to you'
            })

        }

        if (appointment.status !== 'Pending') {

            return res.status(400).json({
                message: 'Only pending appointments can be accepted'
            })

        }

        appointment.status = 'Confirmed'

        await appointment.save()

        res.status(200).json({

            message: 'Appointment accepted successfully',

            appointment

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to accept appointment',
            error: error.message
        })

    }

}





exports.rejectAppointmentController = async (req, res) => {

    try {

        const vetId = req.userId

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                message: 'Invalid appointment ID'
            })

        }

        const appointment = await Appointment.findOne({
            _id: id,
            veterinarianId: vetId
        })

        if (!appointment) {

            return res.status(404).json({
                message: 'Appointment not found or not assigned to you'
            })

        }

        if (
            appointment.status === 'Completed' ||
            appointment.status === 'Cancelled' ||
            appointment.status === 'Rejected'
        ) {

            return res.status(400).json({
                message: 'This appointment cannot be rejected'
            })

        }

        appointment.status = 'Rejected'

        await appointment.save()

        res.status(200).json({

            message: 'Appointment rejected successfully',

            appointment

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to reject appointment',
            error: error.message
        })

    }

}





exports.completeAppointmentController = async (req, res) => {

    try {

        const vetId = req.userId

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                message: 'Invalid appointment ID'
            })

        }

        const appointment = await Appointment.findOne({
            _id: id,
            veterinarianId: vetId
        })

        if (!appointment) {

            return res.status(404).json({
                message: 'Appointment not found or not assigned to you'
            })

        }

        if (appointment.status !== 'Confirmed') {

            return res.status(400).json({
                message: 'Only confirmed appointments can be completed'
            })

        }

        appointment.status = 'Completed'

        await appointment.save()

        res.status(200).json({

            message: 'Appointment completed successfully',

            appointment

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to complete appointment',
            error: error.message
        })

    }

}





exports.getVetPatientsController = async (req, res) => {

    try {

        const vetId = req.userId

        const appointments = await Appointment.find({
            veterinarianId: vetId
        })
            .populate('petId')
            .populate('userId', 'name email phone')

        // Remove duplicate pets
        const patientMap = new Map()

        appointments.forEach(appointment => {

            if (appointment.petId) {

                const petId = appointment.petId._id.toString()

                if (!patientMap.has(petId)) {

                    patientMap.set(petId, {

                        pet: appointment.petId,

                        owner: appointment.userId,

                        appointmentCount: 1

                    })

                } else {

                    patientMap.get(petId).appointmentCount++

                }

            }

        })

        const patients = Array.from(patientMap.values())

        res.status(200).json({

            message: 'Patients fetched successfully',

            totalPatients: patients.length,

            patients

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to fetch patients',
            error: error.message
        })

    }

}





exports.createMedicalRecordController = async (req, res) => {

    try {

        const vetId = req.userId

        const {
            appointmentId,
            diagnosis,
            symptoms,
            treatment,
            prescription,
            notes,
            followUpDate
        } = req.body

        if (!appointmentId || !diagnosis) {

            return res.status(400).json({
                message: 'Appointment ID and diagnosis are required'
            })

        }

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {

            return res.status(400).json({
                message: 'Invalid appointment ID'
            })

        }

        // Find appointment assigned to this veterinarian
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            veterinarianId: vetId,
            status: 'Completed'
        })

        if (!appointment) {

            return res.status(404).json({
                message: 'Completed appointment not found or not assigned to you'
            })

        }

        // Prevent duplicate medical record for same appointment
        const existingRecord = await MedicalRecord.findOne({
            appointmentId: appointment._id
        })

        if (existingRecord) {

            return res.status(400).json({
                message: 'Medical record already exists for this appointment'
            })

        }

        const medicalRecord = new MedicalRecord({

            petId: appointment.petId,

            ownerId: appointment.userId,

            veterinarianId: vetId,

            appointmentId: appointment._id,

            recordType: 'Consultation',

            diagnosis,

            symptoms: symptoms || '',

            treatment: treatment || '',

            prescription: prescription || '',

            notes: notes || '',

            followUpDate: followUpDate || null

        })

        await medicalRecord.save()

        res.status(201).json({

            message: 'Medical record created successfully',

            medicalRecord

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to create medical record',
            error: error.message
        })

    }

}



exports.getVetMedicalRecordsController = async (req, res) => {

    try {

        const vetId = req.userId

        const medicalRecords = await MedicalRecord.find({
            veterinarianId: vetId
        })
            .populate('petId')
            .populate('ownerId', 'name email phone')
            .populate('appointmentId')
            .sort({ createdAt: -1 })

        res.status(200).json({

            message: 'Medical records fetched successfully',

            medicalRecords

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to fetch medical records',
            error: error.message
        })

    }

}





exports.createVaccinationRecordController = async (req, res) => {

    try {

        const vetId = req.userId

        const {
            appointmentId,
            vaccineName,
            vaccinationDate,
            nextVaccinationDate,
            notes
        } = req.body

        if (
            !appointmentId ||
            !vaccineName ||
            !vaccinationDate
        ) {

            return res.status(400).json({
                message: 'Appointment ID, vaccine name and vaccination date are required'
            })

        }

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {

            return res.status(400).json({
                message: 'Invalid appointment ID'
            })

        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            veterinarianId: vetId,
            status: 'Completed',
            service: 'Vaccination'
        })

        if (!appointment) {

            return res.status(404).json({
                message: 'Completed vaccination appointment not found or not assigned to you'
            })

        }

        const existingRecord = await MedicalRecord.findOne({
            appointmentId: appointment._id
        })

        if (existingRecord) {

            return res.status(400).json({
                message: 'A medical record already exists for this appointment'
            })

        }

        const vaccinationRecord = new MedicalRecord({

            petId: appointment.petId,

            ownerId: appointment.userId,

            veterinarianId: vetId,

            appointmentId: appointment._id,

            recordType: 'Vaccination',

            vaccineName,

            vaccinationDate,

            nextVaccinationDate: nextVaccinationDate || null,

            notes: notes || ''

        })

        await vaccinationRecord.save()

        res.status(201).json({

            message: 'Vaccination record created successfully',

            vaccinationRecord

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to create vaccination record',
            error: error.message
        })

    }

}





exports.getVetProfileController = async (req, res) => {

    try {

        const vet = await User.findOne({
            _id: req.userId,
            role: 'veterinarian'
        }).select('-password')

        if (!vet) {

            return res.status(404).json({
                message: 'Veterinarian profile not found'
            })

        }

        res.status(200).json({

            message: 'Veterinarian profile fetched successfully',

            vet

        })

    } catch (error) {

        res.status(500).json({
            message: 'Failed to fetch veterinarian profile',
            error: error.message
        })

    }

}



// GET AVAILABLE VETERINARIANS
// PUBLIC API

exports.getAvailableVeterinariansController = async (req, res) => {

    try {

        // FETCH VETERINARIANS

        const veterinarians = await User.find({

            // Only veterinarian accounts
            role: 'veterinarian',

            // Active accounts or older records
            // where status was not saved
            $and: [

                {
                    $or: [
                        { status: /^Active$/i },
                        { status: { $exists: false } },
                        { status: null },
                        { status: '' }
                    ]
                },

                {
                    $or: [
                        { availability: /^Available$/i },
                        { availability: { $exists: false } },
                        { availability: null },
                        { availability: '' }
                    ]
                }

            ]

        })

        // SELECT PUBLIC INFORMATION

        .select(
            'name username email phone profileImage specialization qualification experience about availability status'
        )

        // SORT BY NAME

        .sort({

            name: 1

        })


        // RESPONSE

        res.status(200).json({

            success: true,

            message: 'Available veterinarians fetched successfully',

            totalVeterinarians: veterinarians.length,

            veterinarians

        })

    }

    catch (error) {

        console.log('Get Available Veterinarians Error:', error)

        res.status(500).json({

            success: false,

            message: 'Failed to fetch available veterinarians',

            error: error.message

        })

    }

}

// GET OWNER MEDICAL RECORDS

exports.getMyMedicalRecordsController = async (req, res) => {

    try {

        const records = await MedicalRecord.find({
            ownerId: req.userId
        })
        .populate('petId', 'petName petType breed')
        .populate('veterinarianId', 'name email')
        .sort({ createdAt: -1 })

        res.status(200).json({

            success: true,

            message: 'Medical records fetched successfully',

            totalRecords: records.length,

            records

        })

    } catch (error) {

        console.log('Get Owner Medical Records Error:', error)

        res.status(500).json({

            success: false,

            message: 'Failed to fetch medical records',

            error: error.message

        })

    }

}