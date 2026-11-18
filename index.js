const express = require('express')

const cors = require('cors')

require('dotenv').config()

const routes = require('./routing/allRoutes')

require('./config/db')


const server = express()


server.use(cors())

server.use(express.json())

server.use(express.urlencoded({ extended: true }))

server.use('/uploads', express.static('./uploads'))


// API Routes
server.use(routes)


server.get('/', (req, res) => {

    res.send('PetCare Server Running Successfully')

})


const PORT = process.env.PORT || 3000

server.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`)

})