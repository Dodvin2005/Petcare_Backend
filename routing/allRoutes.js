const express = require('express')

const router = express.Router()

// ========================================
// CONTROLLERS
// ========================================

const userController = require('../controllers/userController')
const petController = require('../controllers/petController')
const appointmentController = require('../controllers/appointmentController')
const vetController = require('../controllers/vetController')
const adminController = require('../controllers/adminController')
const serviceController = require('../controllers/serviceController')
const paymentController = require('../controllers/paymentController')
// ========================================
// MIDDLEWARE
// ========================================

const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const multerConfig = require('../middleware/multerMiddleware')


// ========================================
// AUTHENTICATION ROUTES
// ========================================

// User Registration
router.post(
    '/register',
    userController.registerController
)

// Admin Registration
router.post(
    '/admin/register',
    userController.adminRegisterController
)

// Common Login
router.post(
    '/login',
    userController.loginController
)


// ========================================
// PROFILE ROUTES
// ========================================

// Get Profile
router.get(
    '/profile',
    authMiddleware,
    userController.getUserProfileController
)

// Update Profile
router.put(
    '/profile',
    authMiddleware,
    userController.updateUserProfileController
)


// ========================================
// PET OWNER ROUTES
// ========================================

// Register Pet
router.post(
    '/pets/register',
    authMiddleware,
    roleMiddleware('user'),
    multerConfig.single('petImage'),
    petController.registerPetController
)

// Get My Pets
router.get(
    '/pets/my-pets',
    authMiddleware,
    roleMiddleware('user'),
    petController.getMyPetsController
)

// Get Single Pet
router.get(
    '/pets/:id',
    authMiddleware,
    roleMiddleware('user'),
    petController.getPetController
)

// Update Pet
router.put(
    '/pets/:id',
    authMiddleware,
    roleMiddleware('user'),
    multerConfig.single('petImage'),
    petController.updatePetController
)

// Delete Pet
router.delete(
    '/pets/:id',
    authMiddleware,
    roleMiddleware('user'),
    petController.deletePetController
)


// ========================================
// APPOINTMENT ROUTES - PET OWNER
// ========================================

// Book Appointment
router.post(
    '/book',
    authMiddleware,
    roleMiddleware('user'),
    appointmentController.bookAppointmentController
)

// Get My Appointments
router.get(
    '/my-appointments',
    authMiddleware,
    roleMiddleware('user'),
    appointmentController.getMyAppointmentsController
)

// Cancel Appointment
router.put(
    '/cancel/:id',
    authMiddleware,
    roleMiddleware('user'),
    appointmentController.cancelAppointmentController
)

// Delete Cancelled Appointment
router.delete(
    '/delete/:id',
    authMiddleware,
    roleMiddleware('user'),
    appointmentController.deleteAppointmentController
)


// ========================================
// PUBLIC - GET ACTIVE SERVICES
// ========================================

router.get(
    '/services',
    serviceController.getPublicServicesController
)
// Get Single Appointment
router.get(
    '/appointment/:id',
    authMiddleware,
    roleMiddleware('user'),
    appointmentController.getAppointmentController
)


// ========================================
// USER - AVAILABLE SERVICES
// ========================================

// Get Active Services
router.get(
    '/services/active',
    authMiddleware,
    roleMiddleware('user'),
    serviceController.getActiveServicesController
)


// ========================================
// USER - AVAILABLE VETERINARIANS
// ========================================

router.get(
    '/veterinarians/available',
    authMiddleware,
    roleMiddleware('user'),
    vetController.getAvailableVeterinariansController
)


// ========================================
// USER - MEDICAL RECORDS
// ========================================

router.get(
    '/my-medical-records',
    authMiddleware,
    roleMiddleware('user'),
    vetController.getMyMedicalRecordsController
)


// ========================================
// ADMIN - VETERINARIAN MANAGEMENT
// ========================================

// Add Veterinarian
router.post(
    '/admin/add-veterinarian',
    authMiddleware,
    roleMiddleware('admin'),
    multerConfig.single('profileImage'),
    adminController.addVeterinarianController
)

// Get All Veterinarians
router.get(
    '/admin/veterinarians',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getAllVeterinariansController
)

// Get Single Veterinarian
router.get(
    '/admin/veterinarians/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getSingleVeterinarianController
)

// Update Veterinarian
router.put(
    '/admin/veterinarians/:id',
    authMiddleware,
    roleMiddleware('admin'),
    multerConfig.single('profileImage'),
    adminController.updateVeterinarianController
)

// Delete Veterinarian
router.delete(
    '/admin/veterinarians/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.deleteVeterinarianController
)

// Update Veterinarian Status
router.patch(
    '/admin/veterinarians/:id/status',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.updateVeterinarianStatusController
)


// ========================================
// ADMIN - USER MANAGEMENT
// ========================================

// Get All Users
router.get(
    '/admin/users',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getAllUsersController
)

// Get Single User
router.get(
    '/admin/users/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getSingleUserController
)

// Update User
router.put(
    '/admin/users/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.updateUserController
)

// Delete User
router.delete(
    '/admin/users/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.deleteUserController
)


// ========================================
// ADMIN - PET MANAGEMENT
// ========================================

// Get All Pets
router.get(
    '/admin/pets',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getAllPetsController
)

// Get Single Pet
router.get(
    '/admin/pets/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getSinglePetAdminController
)

// Update Pet
router.put(
    '/admin/pets/:id',
    authMiddleware,
    roleMiddleware('admin'),
    multerConfig.single('petImage'),
    adminController.updatePetAdminController
)

// Delete Pet
router.delete(
    '/admin/pets/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.deletePetAdminController
)


// ========================================
// ADMIN - APPOINTMENT MANAGEMENT
// ========================================

// Get All Appointments
router.get(
    '/admin/appointments',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getAllAppointmentsController
)

// Search Appointments
router.get(
    '/admin/appointments/search',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.searchAppointmentsController
)

// Get Single Appointment
router.get(
    '/admin/appointments/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.getSingleAppointmentAdminController
)

// Update Appointment Status
router.put(
    '/admin/appointments/:id/status',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.updateAppointmentStatusAdminController
)

// Delete Appointment
router.delete(
    '/admin/appointments/:id',
    authMiddleware,
    roleMiddleware('admin'),
    adminController.deleteAppointmentAdminController
)


// ========================================
// ADMIN - SERVICE MANAGEMENT
// ========================================

// Get All Services
router.get(
    '/admin/services',
    authMiddleware,
    roleMiddleware('admin'),
    serviceController.getAllServicesController
)

// Add Service
router.post(
    '/admin/services',
    authMiddleware,
    roleMiddleware('admin'),
    serviceController.addServiceController
)

// Get Single Service
router.get(
    '/admin/services/:id',
    authMiddleware,
    roleMiddleware('admin'),
    serviceController.getSingleServiceController
)

// Update Service
router.put(
    '/admin/services/:id',
    authMiddleware,
    roleMiddleware('admin'),
    serviceController.updateServiceController
)

// Delete Service
router.delete(
    '/admin/services/:id',
    authMiddleware,
    roleMiddleware('admin'),
    serviceController.deleteServiceController
)

// Update Service Status
router.put(
    '/admin/services/:id/status',
    authMiddleware,
    roleMiddleware('admin'),
    serviceController.updateServiceStatusController
)


// ========================================
// VETERINARIAN ROUTES
// ========================================

// Dashboard
router.get(
    '/vet/dashboard',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.getVetDashboardController
)

// Get Appointments
router.get(
    '/vet/appointments',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.getVetAppointmentsController
)

// Accept Appointment
router.put(
    '/vet/appointments/accept/:id',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.acceptAppointmentController
)

// Reject Appointment
router.put(
    '/vet/appointments/reject/:id',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.rejectAppointmentController
)

// Complete Appointment
router.put(
    '/vet/appointments/complete/:id',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.completeAppointmentController
)

// Get Patients
router.get(
    '/vet/patients',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.getVetPatientsController
)

// Create Medical Record
router.post(
    '/vet/medical-records',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.createMedicalRecordController
)

// Get Medical Records
router.get(
    '/vet/medical-records',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.getVetMedicalRecordsController
)

// Create Vaccination Record
router.post(
    '/vet/vaccinations',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.createVaccinationRecordController
)

// Get Veterinarian Profile
router.get(
    '/vet/profile',
    authMiddleware,
    roleMiddleware('veterinarian'),
    vetController.getVetProfileController
)



// ========================================
// PAYMENT ROUTES - PET OWNER
// ========================================

// Create Dummy Payment

router.post(
    '/payment/create',
    authMiddleware,
    roleMiddleware('user'),
    paymentController.createPaymentController
)



// GET MY PAYMENTS
router.get(
    '/my-payments',
    authMiddleware,
    roleMiddleware('user'),
    paymentController.getMyPaymentsController
)

// GET SINGLE PAYMENT
router.get(
    '/payment/:id',
    authMiddleware,
    roleMiddleware('user'),
    paymentController.getSinglePaymentController
)

module.exports = router