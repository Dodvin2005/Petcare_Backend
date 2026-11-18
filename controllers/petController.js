const pets = require('../Models/petModel')


// REGISTER PET

exports.registerPetController = async (req, res) => {

    console.log('Inside registerPetController')

    try {

        const {
            petName,
            petType,
            breed,
            gender,
            dateOfBirth,
            weight,
            colour,
            identificationNumber,
            vaccinationStatus,
            lastVaccinationDate,
            existingMedicalConditions,
            medicalHistory,
            neuteredOrSpayed,
            status,
            additionalNotes
        } = req.body

        // Check required fields
        if (!petName || !petType || !gender) {

            return res.status(400).json({
                success: false,
                message: 'Pet name, pet type and gender are required'
            })

        }

        // Create pet
        const newPet = new pets({

            owner: req.userId,

            petName,
            petType,
            breed,
            gender,
            dateOfBirth,
            weight,
            colour,
            identificationNumber,

            petImage: req.file ? req.file.filename : '',

            vaccinationStatus,
            lastVaccinationDate,
            existingMedicalConditions,
            medicalHistory,

            neuteredOrSpayed,
            status,
            additionalNotes

        })

        await newPet.save()

        return res.status(201).json({

            success: true,
            message: 'Pet registered successfully',
            pet: newPet

        })

    }
    catch (error) {

        res.status(500).json({

            success: false,
            message: 'Error registering pet',
            error: error.message

        })

    }

}


// GET ALL PETS OF LOGGED-IN USER

exports.getMyPetsController = async (req, res) => {

    console.log('Inside getMyPetsController')

    try {

        const allPets = await pets.find({
            owner: req.userId
        }).sort({ createdAt: -1 })

        res.status(200).json({

            success: true,
            message: 'Pets fetched successfully',
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


// GET SINGLE PET

exports.getPetController = async (req, res) => {

    console.log('Inside getPetController')

    try {

        const { id } = req.params

        const pet = await pets.findOne({
            _id: id,
            owner: req.userId
        })

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


// UPDATE PET DETAILS

exports.updatePetController = async (req, res) => {

    console.log('Inside updatePetController')

    try {

        const { id } = req.params

        const updatedData = { ...req.body }

        // Update pet image if a new image is uploaded
        if (req.file) {
            updatedData.petImage = req.file.filename
        }

        const updatedPet = await pets.findOneAndUpdate(

            {
                _id: id,
                owner: req.userId
            },

            updatedData,

            {
                new: true,
                runValidators: true
            }

        )

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
            message: 'Error updating pet details',
            error: error.message

        })

    }

}


// DELETE PET

exports.deletePetController = async (req, res) => {

    console.log('Inside deletePetController')

    try {

        const { id } = req.params

        const deletedPet = await pets.findOneAndDelete({

            _id: id,
            owner: req.userId

        })

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