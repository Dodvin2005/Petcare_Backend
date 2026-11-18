const Service = require('../Models/serviceModel')

// GET ALL SERVICES - ADMIN

exports.getAllServicesController = async (req, res) => {

    try {

        const { search, status, category } = req.query

        let query = {}

        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ]
        }

        // Filter Status
        if (status && status !== 'All') {
            query.status = status
        }

        // Filter Category
        if (category && category !== 'All') {
            query.category = category
        }

        const services = await Service.find(query)
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            message: 'Services fetched successfully',
            total: services.length,
            services
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
            error: error.message
        })

    }
}


// ADD NEW SERVICE - ADMIN

exports.addServiceController = async (req, res) => {

    try {

        const {
            name,
            category,
            price,
            duration,
            description,
            icon
        } = req.body

        // Validation
        if (
            !name?.trim() ||
            !category?.trim() ||
            price === undefined ||
            price === '' ||
            !duration?.trim() ||
            !description?.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide all required service details'
            })

        }

        // Price Validation
        if (
            !Number.isFinite(Number(price)) ||
            Number(price) < 0
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide a valid service price'
            })

        }

        // Check Duplicate Service
        const existingService = await Service.findOne({
            name: {
                $regex: `^${name.trim()}$`,
                $options: 'i'
            }
        })

        if (existingService) {

            return res.status(409).json({
                success: false,
                message: 'Service already exists'
            })

        }

        // Create Service
        const newService = new Service({

            name: name.trim(),
            category: category.trim(),
            price: Number(price),
            duration: duration.trim(),
            description: description.trim(),
            icon: icon || '🐾',
            status: 'Active'

        })

        await newService.save()

        res.status(201).json({
            success: true,
            message: 'Service added successfully',
            service: newService
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to add service',
            error: error.message
        })

    }
}


// GET SINGLE SERVICE - ADMIN

exports.getSingleServiceController = async (req, res) => {

    try {

        const { id } = req.params

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            })

        }

        const service = await Service.findById(id)

        if (!service) {

            return res.status(404).json({
                success: false,
                message: 'Service not found'
            })

        }

        res.status(200).json({
            success: true,
            message: 'Service fetched successfully',
            service
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to fetch service',
            error: error.message
        })

    }
}


// UPDATE SERVICE - ADMIN

exports.updateServiceController = async (req, res) => {

    try {

        const { id } = req.params

        const {
            name,
            category,
            price,
            duration,
            description,
            icon
        } = req.body

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            })

        }

        const service = await Service.findById(id)

        if (!service) {

            return res.status(404).json({
                success: false,
                message: 'Service not found'
            })

        }

        // Price Validation
        if (
            price !== undefined &&
            (
                price === '' ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0
            )
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide a valid service price'
            })

        }

        // Duplicate Name Check
        if (name?.trim()) {

            const duplicate = await Service.findOne({
                _id: { $ne: id },
                name: {
                    $regex: `^${name.trim()}$`,
                    $options: 'i'
                }
            })

            if (duplicate) {

                return res.status(409).json({
                    success: false,
                    message: 'Another service already uses this name'
                })

            }

        }

        // Update Fields
        service.name = name?.trim() || service.name
        service.category = category?.trim() || service.category
        service.price = price !== undefined
            ? Number(price)
            : service.price

        service.duration = duration?.trim() || service.duration
        service.description = description?.trim() || service.description
        service.icon = icon ?? service.icon

        await service.save()

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            service
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to update service',
            error: error.message
        })

    }
}


// DELETE SERVICE - ADMIN

exports.deleteServiceController = async (req, res) => {

    try {

        const { id } = req.params

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            })

        }

        const service = await Service.findById(id)

        if (!service) {

            return res.status(404).json({
                success: false,
                message: 'Service not found'
            })

        }

        await Service.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to delete service',
            error: error.message
        })

    }
}


// UPDATE SERVICE STATUS - ADMIN

exports.updateServiceStatusController = async (req, res) => {

    try {

        const { id } = req.params
        const { status } = req.body

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            })

        }

        if (!['Active', 'Inactive'].includes(status)) {

            return res.status(400).json({
                success: false,
                message: 'Status must be Active or Inactive'
            })

        }

        const service = await Service.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )

        if (!service) {

            return res.status(404).json({
                success: false,
                message: 'Service not found'
            })

        }

        res.status(200).json({
            success: true,
            message: 'Service status updated successfully',
            service
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to update service status',
            error: error.message
        })

    }
}


// GET ACTIVE SERVICES - PET OWNER

exports.getActiveServicesController = async (req, res) => {

    try {

        const services = await Service.find({
            status: 'Active'
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            message: 'Active services fetched successfully',
            total: services.length,
            services
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to fetch active services',
            error: error.message
        })

    }

}


// GET ACTIVE SERVICES - PUBLIC

exports.getPublicServicesController = async (req, res) => {

    try {

        const services = await Service.find({
            status: 'Active'
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            message: 'Public services fetched successfully',
            total: services.length,
            services
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to fetch public services',
            error: error.message
        })

    }

}