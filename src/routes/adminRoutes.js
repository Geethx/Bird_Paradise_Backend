import express from 'express'
import { registerAdmin, loginAdmin, generateReports } from '../controllers/adminController.js'
import { authenticateAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', registerAdmin)
router.post('/login', loginAdmin)
router.get('/reports', authenticateAdmin, generateReports);

export default router;