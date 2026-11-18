const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {

            return res.status(401).json({
                message: 'Please login first'
            })

        }

        const token = authHeader.split(' ')[1]

        if (!process.env.JWTSECRETKEY) {

            return res.status(500).json({
                message: 'JWT secret key is missing'
            })

        }

        const jwtResponse = jwt.verify(
            token,
            process.env.JWTSECRETKEY
        )

        // Store authenticated user information
        req.payload = jwtResponse

        req.userId =
            jwtResponse.userId ||
            jwtResponse.id ||
            jwtResponse._id

        req.userRole = jwtResponse.role

        if (!req.userId || !req.userRole) {

            return res.status(401).json({
                message: 'Invalid authentication token'
            })

        }

        next()

    } catch (error) {

        return res.status(401).json({
            message: 'Invalid or expired token',
            error: error.message
        })

    }

}

module.exports = authMiddleware