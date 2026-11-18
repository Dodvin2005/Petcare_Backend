const multer = require('multer')
const path = require('path')

// Storage configuration
const storage = multer.diskStorage({

    destination: (req, file, callback) => {

    callback(null, './uploads')

},

    filename: (req, file, callback) => {

        const uniqueName = Date.now() + path.extname(file.originalname)

        callback(null, uniqueName)

    }

})

// File filter
const fileFilter = (req, file, callback) => {

    const allowedTypes = /jpeg|jpg|png|webp/

    const extName = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    )

    const mimeType = allowedTypes.test(file.mimetype)

    if (extName && mimeType) {

        callback(null, true)

    } else {

        callback(new Error('Only JPG, JPEG, PNG and WEBP images are allowed'))

    }

}

// Multer configuration
const multerConfig = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

})

module.exports = multerConfig