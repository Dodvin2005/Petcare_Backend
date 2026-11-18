const User = require('../Models/userModel')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Pet = require('../Models/petModel')
const Appointment = require('../Models/appointmentModel')

// ========================================
// ADD VETERINARIAN
// ========================================

exports.addVeterinarianController = async (req, res) => {

    try {

        const {
            name,
            username,
            email,
            password,
            phone,
            address,
            specialization,
            qualification,
            experience,
            license,
            about
        } = req.body

        // Required fields

        if (
            !name ||
            !username ||
            !email ||
            !password ||
            !specialization ||
            !qualification
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            })

        }

        // Password validation

        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            })

        }

        // Normalize email and username

        const normalizedEmail = email.trim().toLowerCase()

        const normalizedUsername = username.trim().toLowerCase()

        // Check existing email

        const existingEmail = await User.findOne({
            email: normalizedEmail
        })

        if (existingEmail) {

            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            })

        }

        // Check existing username

        const existingUsername = await User.findOne({
            username: normalizedUsername
        })

        if (existingUsername) {

            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            })

        }

        // Encrypt password

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create veterinarian

        const newVeterinarian = await User.create({

            name: name.trim(),

            username: normalizedUsername,

            email: normalizedEmail,

            password: hashedPassword,

            phone,

            address,

            specialization,

            qualification,

            experience,

            license,

            about,

            availability: 'Available',

            role: 'veterinarian'

        })

        return res.status(201).json({

            success: true,

            message: 'Veterinarian added successfully',

            veterinarian: {

                _id: newVeterinarian._id,

                name: newVeterinarian.name,

                username: newVeterinarian.username,

                email: newVeterinarian.email,

                phone: newVeterinarian.phone,

                address: newVeterinarian.address,

                specialization: newVeterinarian.specialization,

                qualification: newVeterinarian.qualification,

                experience: newVeterinarian.experience,

                license: newVeterinarian.license,

                about: newVeterinarian.about,

                availability: newVeterinarian.availability,

                role: newVeterinarian.role

            }

        })

    }

    catch (error) {

        console.log('Add Veterinarian Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to add veterinarian',

            error: error.message

        })

    }

}

// ========================================
// ADD VETERINARIAN
// ========================================

exports.addVeterinarianController = async (req, res) => {

    try {

        const {
            name,
            username,
            email,
            password,
            phone,
            address,
            specialization,
            qualification,
            experience,
            license,
            about
        } = req.body

        if (
            !name || !username || !email ||
            !password || !specialization || !qualification
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            })

        }

        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            })

        }

        const normalizedEmail = email.trim().toLowerCase()
        const normalizedUsername = username.trim().toLowerCase()

        if (normalizedUsername.length < 3) {

            return res.status(400).json({
                success: false,
                message: 'Username must contain at least 3 characters'
            })

        }

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        })

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: 'Email or username already exists'
            })

        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const veterinarian = await User.create({

            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,

            phone: phone || '',
            address: address || '',

            specialization,
            qualification,
            experience: experience || '',
            license: license || '',
            about: about || '',

            profileImage: req.file ? req.file.filename : '',

            availability: 'Available',
            status: 'Active',

            role: 'veterinarian'

        })

        const result = veterinarian.toObject()
        delete result.password

        return res.status(201).json({

            success: true,
            message: 'Veterinarian added successfully',
            veterinarian: result

        })

    }
    catch (error) {

        console.log('Add Veterinarian Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to add veterinarian',
            error: error.message
        })

    }

}

// ========================================
// GET ALL VETERINARIANS
// ========================================

exports.getAllVeterinariansController = async (req, res) => {

    try {

        const {
            search,
            status,
            availability,
            specialization
        } = req.query

        let query = {
            role: 'veterinarian'
        }

        // SEARCH
        if (search && search.trim()) {

            const searchRegex = {
                $regex: search.trim(),
                $options: 'i'
            }

            query.$or = [
                { name: searchRegex },
                { username: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { specialization: searchRegex },
                { qualification: searchRegex }
            ]

        }

        // STATUS FILTER
        if (status && status !== 'All') {
            query.status = status
        }

        // AVAILABILITY FILTER
        if (availability && availability !== 'All') {
            query.availability = availability
        }

        // SPECIALIZATION FILTER
        if (specialization && specialization !== 'All') {
            query.specialization = specialization
        }

        const veterinarians = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })

        return res.status(200).json({

            success: true,
            message: 'Veterinarians fetched successfully',

            total: veterinarians.length,

            veterinarians

        })

    }
    catch (error) {

        console.log('Get Veterinarians Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch veterinarians',
            error: error.message
        })

    }

}

// ========================================
// GET SINGLE VETERINARIAN
// ========================================

exports.getSingleVeterinarianController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid veterinarian ID'
            })

        }

        const veterinarian = await User.findOne({
            _id: id,
            role: 'veterinarian'
        }).select('-password')

        if (!veterinarian) {

            return res.status(404).json({
                success: false,
                message: 'Veterinarian not found'
            })

        }

        return res.status(200).json({

            success: true,
            message: 'Veterinarian details fetched successfully',
            veterinarian

        })

    }
    catch (error) {

        console.log('Get Single Veterinarian Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch veterinarian',
            error: error.message
        })

    }

}

// ========================================
// UPDATE VETERINARIAN
// ========================================

exports.updateVeterinarianController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid veterinarian ID'
            })

        }

        const veterinarian = await User.findOne({
            _id: id,
            role: 'veterinarian'
        })

        if (!veterinarian) {

            return res.status(404).json({
                success: false,
                message: 'Veterinarian not found'
            })

        }

        const {
            name,
            username,
            email,
            phone,
            address,
            specialization,
            qualification,
            experience,
            license,
            about,
            availability
        } = req.body

        const updatedData = {}

        // NAME
        if (name !== undefined) {

            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name cannot be empty'
                })
            }

            updatedData.name = name.trim()

        }

        // USERNAME
        if (username !== undefined) {

            const normalizedUsername = username.trim().toLowerCase()

            if (normalizedUsername.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Username must contain at least 3 characters'
                })
            }

            const existingUsername = await User.findOne({
                username: normalizedUsername,
                _id: { $ne: id }
            })

            if (existingUsername) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                })
            }

            updatedData.username = normalizedUsername

        }

        // EMAIL
        if (email !== undefined) {

            const normalizedEmail = email.trim().toLowerCase()

            if (!normalizedEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email cannot be empty'
                })
            }

            const existingEmail = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: id }
            })

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                })
            }

            updatedData.email = normalizedEmail

        }

        // OTHER DETAILS
        if (phone !== undefined) updatedData.phone = phone
        if (address !== undefined) updatedData.address = address

        if (specialization !== undefined) {
            updatedData.specialization = specialization
        }

        if (qualification !== undefined) {
            updatedData.qualification = qualification
        }

        if (experience !== undefined) {
            updatedData.experience = experience
        }

        if (license !== undefined) {
            updatedData.license = license
        }

        if (about !== undefined) {
            updatedData.about = about
        }

        if (availability !== undefined) {

            if (!['Available', 'Unavailable'].includes(availability)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid availability value'
                })
            }

            updatedData.availability = availability

        }

        // PROFILE IMAGE
        if (req.file) {
            updatedData.profileImage = req.file.filename
        }

        const updatedVeterinarian = await User.findByIdAndUpdate(
            id,
            { $set: updatedData },
            {
                new: true,
                runValidators: true
            }
        ).select('-password')

        return res.status(200).json({

            success: true,
            message: 'Veterinarian updated successfully',
            veterinarian: updatedVeterinarian

        })

    }
    catch (error) {

        console.log('Update Veterinarian Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to update veterinarian',
            error: error.message
        })

    }

}

// ========================================
// DELETE VETERINARIAN
// ========================================

exports.deleteVeterinarianController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid veterinarian ID'
            })

        }

        const veterinarian = await User.findOne({
            _id: id,
            role: 'veterinarian'
        })

        if (!veterinarian) {

            return res.status(404).json({
                success: false,
                message: 'Veterinarian not found'
            })

        }

        const MedicalRecord = require('../Models/medicalRecordModel')

        const appointmentExists = await Appointment.exists({
            veterinarianId: id
        })

        const medicalRecordExists = await MedicalRecord.exists({
            veterinarianId: id
        })

        if (appointmentExists || medicalRecordExists) {

            return res.status(409).json({

                success: false,

                message: 'Cannot delete veterinarian because appointment or medical record history exists. Deactivate the account instead.'

            })

        }

        await User.findByIdAndDelete(id)

        return res.status(200).json({

            success: true,
            message: 'Veterinarian deleted successfully'

        })

    }
    catch (error) {

        console.log('Delete Veterinarian Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to delete veterinarian',
            error: error.message
        })

    }

}

// ========================================
// UPDATE VETERINARIAN STATUS
// ========================================

exports.updateVeterinarianStatusController = async (req, res) => {

    try {

        const { id } = req.params
        const { status } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid veterinarian ID'
            })

        }

        if (!['Active', 'Inactive'].includes(status)) {

            return res.status(400).json({
                success: false,
                message: 'Status must be Active or Inactive'
            })

        }

        const veterinarian = await User.findOneAndUpdate(

            {
                _id: id,
                role: 'veterinarian'
            },

            {
                $set: { status }
            },

            {
                new: true,
                runValidators: true
            }

        ).select('-password')

        if (!veterinarian) {

            return res.status(404).json({
                success: false,
                message: 'Veterinarian not found'
            })

        }

        return res.status(200).json({

            success: true,
            message: `Veterinarian ${status.toLowerCase()} successfully`,
            veterinarian

        })

    }
    catch (error) {

        console.log('Veterinarian Status Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to update veterinarian status',
            error: error.message
        })

    }

}
// user section
// ========================================
// GET ALL USERS
// ========================================

exports.getAllUsersController = async (req, res) => {

    try {

        const { search } = req.query

        let query = {
            role: 'user'
        }

        // Search users

        if (search) {

            query.$or = [

                { name: { $regex: search, $options: 'i' } },

                { username: { $regex: search, $options: 'i' } },

                { email: { $regex: search, $options: 'i' } }

            ]

        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })

        return res.status(200).json({

            success: true,

            message: 'Users fetched successfully',

            total: users.length,

            users

        })

    }

    catch (error) {

        console.log('Get All Users Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to fetch users',

            error: error.message

        })

    }

}

// ========================================
// GET SINGLE USER
// ========================================

exports.getSingleUserController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            })
        }

        const user = await User.findOne({
            _id: id,
            role: 'user'
        }).select('-password')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'User details fetched successfully',
            user
        })

    }

    catch (error) {

        console.log('Get Single User Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        })

    }

}

// ========================================
// UPDATE USER
// ========================================

exports.updateUserController = async (req, res) => {

    try {

        const { id } = req.params

        const {
            name,
            username,
            email,
            phone,
            address
        } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            })
        }

        const user = await User.findOne({
            _id: id,
            role: 'user'
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const updatedData = {}

        // Name
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name cannot be empty'
                })
            }

            updatedData.name = name.trim()
        }

        // Username
        if (username !== undefined) {

            const normalizedUsername = username.trim().toLowerCase()

            if (normalizedUsername.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Username must contain at least 3 characters'
                })
            }

            const existingUsername = await User.findOne({
                username: normalizedUsername,
                _id: { $ne: id }
            })

            if (existingUsername) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                })
            }

            updatedData.username = normalizedUsername
        }

        // Email
        if (email !== undefined) {

            const normalizedEmail = email.trim().toLowerCase()

            if (!normalizedEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email cannot be empty'
                })
            }

            const existingEmail = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: id }
            })

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                })
            }

            updatedData.email = normalizedEmail
        }

        if (phone !== undefined) {
            updatedData.phone = phone
        }

        if (address !== undefined) {
            updatedData.address = address
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updatedData },
            {
                new: true,
                runValidators: true
            }
        ).select('-password')

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        })

    }

    catch (error) {

        console.log('Update User Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        })

    }

}


// ========================================
// DELETE USER
// ========================================

exports.deleteUserController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            })
        }

        const deletedUser = await User.findOneAndDelete({
            _id: id,
            role: 'user'
        })

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({

            success: true,

            message: 'User deleted successfully',

            user: {
                _id: deletedUser._id,
                name: deletedUser.name,
                email: deletedUser.email
            }

        })

    }

    catch (error) {

        console.log('Delete User Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        })

    }

}

// pet
// GET ALL PETS - ADMIN

exports.getAllPetsController = async (req, res) => {

    try {

        const { search, petType, status } = req.query

        let query = {}

        // Search pets
        if (search) {

            query.$or = [
                { petName: { $regex: search, $options: 'i' } },
                { breed: { $regex: search, $options: 'i' } },
                { identificationNumber: { $regex: search, $options: 'i' } }
            ]

        }

        // Filter by pet type
        if (petType && petType !== 'All') {
            query.petType = petType
        }

        // Filter by status
        if (status && status !== 'All') {
            query.status = status
        }

        const allPets = await Pet.find(query)
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 })

        res.status(200).json({

            success: true,
            message: 'All pets fetched successfully',
            totalPets: allPets.length,
            pets: allPets

        })

    }
    catch (error) {

        res.status(500).json({

            success: false,
            message: 'Error fetching pets',
            error: error.message

        })

    }

}

// GET SINGLE PET - ADMIN

exports.getSinglePetAdminController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid pet ID'
            })

        }

        const pet = await Pet.findById(id)
            .populate('owner', 'name email phone')

        if (!pet) {

            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            })

        }

        res.status(200).json({

            success: true,
            message: 'Pet details fetched successfully',
            pet

        })

    }
    catch (error) {

        res.status(500).json({

            success: false,
            message: 'Error fetching pet details',
            error: error.message

        })

    }

}

// UPDATE PET - ADMIN

exports.updatePetAdminController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid pet ID'
            })

        }

        const allowedFields = [

            'petName',
            'petType',
            'breed',
            'gender',
            'dateOfBirth',
            'weight',
            'colour',
            'identificationNumber',
            'vaccinationStatus',
            'lastVaccinationDate',
            'existingMedicalConditions',
            'medicalHistory',
            'neuteredOrSpayed',
            'status',
            'additionalNotes'

        ]

        const updatedData = {}

        allowedFields.forEach(field => {

            if (req.body[field] !== undefined) {
                updatedData[field] = req.body[field]
            }

        })

        // Update pet image
        if (req.file) {
            updatedData.petImage = req.file.filename
        }

        const updatedPet = await Pet.findByIdAndUpdate(

            id,

            { $set: updatedData },

            {
                new: true,
                runValidators: true
            }

        ).populate('owner', 'name email phone')

        if (!updatedPet) {

            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            })

        }

        res.status(200).json({

            success: true,
            message: 'Pet details updated successfully',
            pet: updatedPet

        })

    }
    catch (error) {

        res.status(500).json({

            success: false,
            message: 'Error updating pet',
            error: error.message

        })

    }

}

// DELETE PET - ADMIN

exports.deletePetAdminController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid pet ID'
            })

        }

        const deletedPet = await Pet.findByIdAndDelete(id)

        if (!deletedPet) {

            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            })

        }

        res.status(200).json({

            success: true,
            message: 'Pet deleted successfully'

        })

    }
    catch (error) {

        res.status(500).json({

            success: false,
            message: 'Error deleting pet',
            error: error.message

        })

    }

}

// ========================================
// ADMIN APPOINTMENT MANAGEMENT
// ========================================


// ========================================
// GET ALL APPOINTMENTS - ADMIN
// ========================================

exports.getAllAppointmentsController = async (req, res) => {

    try {

        const {
            search,
            status,
            service,
            startDate,
            endDate
        } = req.query

        let query = {}

        // Filter by status
        if (status && status !== 'All') {
            query.status = status
        }

        // Filter by service
        if (service && service !== 'All') {
            query.service = service
        }

        // Filter by appointment date
        if (startDate || endDate) {

            query.appointmentDate = {}

            if (startDate) {
                query.appointmentDate.$gte = new Date(startDate)
            }

            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)

                query.appointmentDate.$lte = end
            }

        }

        let appointments = await Appointment.find(query)

            .populate('userId', 'name email phone')

            .populate('petId', 'petName petType breed petImage')

            .populate('veterinarianId', 'name email phone specialization')

            .sort({ appointmentDate: -1 })

        // Search by owner, pet, service or concern
        if (search) {

            const searchText = search.toLowerCase()

            appointments = appointments.filter(appointment => {

                const ownerName =
                    appointment.userId?.name?.toLowerCase() || ''

                const petName =
                    appointment.petId?.petName?.toLowerCase() || ''

                const serviceName =
                    appointment.service?.toLowerCase() || ''

                const concern =
                    appointment.concern?.toLowerCase() || ''

                const vetName =
                    appointment.veterinarianId?.name?.toLowerCase() || ''

                return (
                    ownerName.includes(searchText) ||
                    petName.includes(searchText) ||
                    serviceName.includes(searchText) ||
                    concern.includes(searchText) ||
                    vetName.includes(searchText)
                )

            })

        }

        return res.status(200).json({

            success: true,

            message: 'All appointments fetched successfully',

            totalAppointments: appointments.length,

            appointments

        })

    }

    catch (error) {

        console.log('Admin Get Appointments Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to fetch appointments',

            error: error.message

        })

    }

}


// ========================================
// GET SINGLE APPOINTMENT - ADMIN
// ========================================

exports.getSingleAppointmentAdminController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: 'Invalid appointment ID'

            })

        }

        const appointment = await Appointment.findById(id)

            .populate('userId', 'name email phone address')

            .populate('petId')

            .populate('veterinarianId', 'name email phone specialization qualification')

        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: 'Appointment not found'

            })

        }

        return res.status(200).json({

            success: true,

            message: 'Appointment details fetched successfully',

            appointment

        })

    }

    catch (error) {

        console.log('Admin Single Appointment Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to fetch appointment details',

            error: error.message

        })

    }

}


// ========================================
// SEARCH APPOINTMENTS - ADMIN
// ========================================

exports.searchAppointmentsController = async (req, res) => {

    try {

        const { search } = req.query

        if (!search || !search.trim()) {

            return res.status(400).json({

                success: false,

                message: 'Please provide a search keyword'

            })

        }

        const searchText = search.trim().toLowerCase()

        const appointments = await Appointment.find()

            .populate('userId', 'name email phone')

            .populate('petId', 'petName petType breed')

            .populate('veterinarianId', 'name email specialization')

            .sort({ appointmentDate: -1 })

        const filteredAppointments = appointments.filter(appointment => {

            const owner = appointment.userId?.name?.toLowerCase() || ''

            const pet = appointment.petId?.petName?.toLowerCase() || ''

            const vet = appointment.veterinarianId?.name?.toLowerCase() || ''

            const service = appointment.service?.toLowerCase() || ''

            const concern = appointment.concern?.toLowerCase() || ''

            return (
                owner.includes(searchText) ||
                pet.includes(searchText) ||
                vet.includes(searchText) ||
                service.includes(searchText) ||
                concern.includes(searchText)
            )

        })

        return res.status(200).json({

            success: true,

            message: 'Appointment search completed',

            totalAppointments: filteredAppointments.length,

            appointments: filteredAppointments

        })

    }

    catch (error) {

        console.log('Search Appointments Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to search appointments',

            error: error.message

        })

    }

}


// ========================================
// UPDATE APPOINTMENT STATUS - ADMIN
// ========================================

exports.updateAppointmentStatusAdminController = async (req, res) => {

    try {

        const { id } = req.params

        const { status } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: 'Invalid appointment ID'

            })

        }

        if (!status) {

            return res.status(400).json({

                success: false,

                message: 'Please provide appointment status'

            })

        }

        // Validate against appointment model enum
        const statusPath = Appointment.schema.path('status')

        const allowedStatuses = statusPath?.enumValues || []

        if (
            allowedStatuses.length > 0 &&
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message: 'Invalid appointment status',

                allowedStatuses

            })

        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(

            id,

            { $set: { status } },

            {
                new: true,
                runValidators: true
            }

        )

            .populate('userId', 'name email phone')

            .populate('petId', 'petName petType breed')

            .populate('veterinarianId', 'name email specialization')

        if (!updatedAppointment) {

            return res.status(404).json({

                success: false,

                message: 'Appointment not found'

            })

        }

        return res.status(200).json({

            success: true,

            message: 'Appointment status updated successfully',

            appointment: updatedAppointment

        })

    }

    catch (error) {

        console.log('Update Appointment Status Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to update appointment status',

            error: error.message

        })

    }

}


// ========================================
// DELETE APPOINTMENT - ADMIN
// ========================================

exports.deleteAppointmentAdminController = async (req, res) => {

    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: 'Invalid appointment ID'

            })

        }

        const deletedAppointment = await Appointment.findByIdAndDelete(id)

        if (!deletedAppointment) {

            return res.status(404).json({

                success: false,

                message: 'Appointment not found'

            })

        }

        return res.status(200).json({

            success: true,

            message: 'Appointment deleted successfully',

            appointment: {

                _id: deletedAppointment._id,

                service: deletedAppointment.service,

                status: deletedAppointment.status

            }

        })

    }

    catch (error) {

        console.log('Delete Appointment Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Failed to delete appointment',

            error: error.message

        })

    }

}