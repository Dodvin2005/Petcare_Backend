const roleMiddleware = (...allowedRoles) => {

    return (req, res, next) => {

        try {

            // Check logged-in user
            if (!req.userId || !req.userRole) {

                return res.status(401).json({
                    message: 'Unauthorized access'
                })

            }

            // Check user role
            if (!allowedRoles.includes(req.userRole)) {

                return res.status(403).json({
                    message: 'Access denied. You do not have permission.'
                })

            }

            next()

        } catch (error) {

            res.status(500).json({
                message: 'Role verification failed',
                error: error.message
            })

        }

    }

}

module.exports = roleMiddleware