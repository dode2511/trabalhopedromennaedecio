import { Router, json } from 'express'
import cors from 'cors'

import {  candidataDelete, candidataIndex, candidataStore, candidataTotalVotos, candidataUpdate, casaPdf } from './controllers/CandidataController.js'
import { votoIndex, votoStore, votoTotais, votoTotais2 } from './controllers/VotoController.js'
import { adminIndex, adminStore } from './controllers/AdminController.js'
import { loginAdmin } from './controllers/LoginController.js'

import upload from './middlewares/FotoStore.js'
import { verificaLogin } from './middlewares/VerificaLogin.js'

const router = Router()

router.use(json())


router.use(cors())


router.get('/candidatas', candidataIndex)
      .post('/candidatas', upload.single('foto'), candidataStore)
      .put('/candidatas/:id', candidataUpdate)
      .delete('/candidatas/:id', candidataDelete)
      .get('/candidatas/total_votos', candidataTotalVotos)
      .get('/candidatas/pdf', casaPdf)


router.get('/votos', votoIndex)
      .post('/votos', votoStore)
      .get('/votos/totais1', votoTotais)
      .get('/votos/totais', votoTotais2)


router.get('/admins', adminIndex)
      .post('/admins', adminStore)

// define a rota de login
router.get('/login', loginAdmin)

export default router