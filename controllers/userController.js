const User = require('../Models/userModel')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')


// COMMON REGISTRATION FUNCTION

const createUser = async (req, res, role) => {

    try {

        const { name, username, email, password } = req.body

        if (!name || !username || !email || !password) {

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

        const existingEmail = await User.findOne({
            email: normalizedEmail
        })

        if (existingEmail) {

            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            })

        }

        const existingUsername = await User.findOne({
            username: normalizedUsername
        })

        if (existingUsername) {

            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            })

        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({

            name: name.trim(),

            username: normalizedUsername,

            email: normalizedEmail,

            password: hashedPassword,

            role: role

        })

        return res.status(201).json({

            success: true,

            message: `${role} registration successful`,

            user: {

                _id: newUser._id,

                name: newUser.name,

                username: newUser.username,

                email: newUser.email,

                role: newUser.role,

                status: newUser.status

            }

        })

    }
    catch (error) {

        console.log('Registration Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Registration failed',

            error: error.message

        })

    }

}


// USER REGISTRATION

exports.registerController = async (req, res) => {

    console.log('Inside User Registration')

    return createUser(req, res, 'user')

}


// ADMIN REGISTRATION

exports.adminRegisterController = async (req, res) => {

    console.log('Inside Admin Registration')

    try {

        const { adminKey } = req.body

        if (!process.env.ADMIN_REGISTER_KEY) {

            return res.status(500).json({

                success: false,

                message: 'Admin registration key is not configured in .env'

            })

        }

        if (
            !adminKey ||
            adminKey.trim() !== process.env.ADMIN_REGISTER_KEY.trim()
        ) {

            return res.status(403).json({

                success: false,

                message: 'Invalid admin registration key'

            })

        }

        return createUser(req, res, 'admin')

    }
    catch (error) {

        console.log('Admin Registration Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Admin registration failed'

        })

    }

}


// VETERINARIAN REGISTRATION

exports.veterinarianRegisterController = async (req, res) => {

    console.log('Inside Veterinarian Registration')

    return createUser(req, res, 'veterinarian')

}


// COMMON LOGIN CONTROLLER

exports.loginController = async (req, res) => {

    try {

        console.log('Inside Login Controller')

        const { email, password } = req.body

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: 'Email and password are required'

            })

        }

        if (!process.env.JWTSECRETKEY) {

            return res.status(500).json({

                success: false,

                message: 'JWT configuration is missing'

            })

        }

        // FIND USER

        const existingUser = await User.findOne({

            email: email.trim().toLowerCase()

        })

        if (!existingUser) {

            return res.status(404).json({

                success: false,

                message: 'Account not found'

            })

        }

        // CHECK PASSWORD

        const isPasswordMatch = await bcrypt.compare(
            password,
            existingUser.password
        )

        if (!isPasswordMatch) {

            return res.status(401).json({

                success: false,

                message: 'Invalid password'

            })

        }


        // CHECK VETERINARIAN ACCOUNT STATUS

        if (
            existingUser.role === 'veterinarian' &&
            existingUser.status === 'Inactive'
        ) {

            return res.status(403).json({

                success: false,

                message: 'Your veterinarian account is inactive. Please contact the administrator.'

            })

        }


        // GENERATE JWT TOKEN

        const token = jwt.sign(

            {

                id: existingUser._id,

                userId: existingUser._id,

                email: existingUser.email,

                role: existingUser.role

            },

            process.env.JWTSECRETKEY,

            {
                expiresIn: '7d'
            }

        )


        // USER RESPONSE DATA

        const userData = {

            _id: existingUser._id,

            id: existingUser._id,

            name: existingUser.name,

            username: existingUser.username,

            email: existingUser.email,

            role: existingUser.role,

            phone: existingUser.phone,

            address: existingUser.address,

            profileImage: existingUser.profileImage,

            specialization: existingUser.specialization,

            qualification: existingUser.qualification,

            experience: existingUser.experience,

            license: existingUser.license,

            about: existingUser.about,

            availability: existingUser.availability,

            status: existingUser.status

        }


        return res.status(200).json({

            success: true,

            message: 'Login successful',

            token,

            user: userData

        })

    }
    catch (error) {

        console.log('Login Error:', error)

        return res.status(500).json({

            success: false,

            message: 'Login failed',

            error: error.message

        })

    }

}


// GET USER / VETERINARIAN PROFILE

exports.getUserProfileController = async (req, res) => {

    try {

        const user = await User.findById(req.userId).select('-password')

        if (!user) {

            return res.status(404).json({

                success: false,

                message: 'User not found'

            })

        }

        return res.status(200).json({

            success: true,

            message: 'Profile fetched successfully',

            user

        })

    }
    catch (error) {

        console.log('Get Profile Error:', error)

        return res.status(500).json({

            success: false,

            message: error.message

        })

    }

}


// UPDATE USER / VETERINARIAN PROFILE

exports.updateUserProfileController = async (req, res) => {

    try {

        const { name, username, phone, address, location } = req.body

        const updatedData = {}


        // BASIC PROFILE DETAILS

        if (name !== undefined) {

            updatedData.name = name.trim()

        }

        if (username !== undefined) {

            const normalizedUsername = username.trim().toLowerCase()

            const existingUsername = await User.findOne({

                username: normalizedUsername,

                _id: { $ne: req.userId }

            })

            if (existingUsername) {

                return res.status(409).json({

                    success: false,

                    message: 'Username already exists'

                })

            }

            updatedData.username = normalizedUsername

        }

        if (phone !== undefined) {

            updatedData.phone = phone

        }


        // ADDRESS / LOCATION

        if (address !== undefined) {

            updatedData.address = address

        }
        else if (location !== undefined) {

            updatedData.address = location

        }


        // GET LOGGED-IN USER

        const loggedInUser = await User.findById(req.userId)

        if (!loggedInUser) {

            return res.status(404).json({

                success: false,

                message: 'User not found'

            })

        }


        // VETERINARIAN PROFESSIONAL DETAILS

        if (loggedInUser.role === 'veterinarian') {

            const {
                specialization,
                qualification,
                experience,
                license,
                about,
                availability
            } = req.body


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

        }


        // SAVE UPDATED PROFILE

        const updatedUser = await User.findByIdAndUpdate(

            req.userId,

            { $set: updatedData },

            {

                new: true,

                runValidators: true

            }

        ).select('-password')


        return res.status(200).json({

            success: true,

            message: 'Profile updated successfully',

            user: updatedUser

        })

    }
    catch (error) {

        console.log('Update Profile Error:', error)

        return res.status(500).json({

            success: false,

            message: error.message

        })

    }

}