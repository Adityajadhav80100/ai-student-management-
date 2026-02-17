const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerBody, loginBody } = require('../validators/authSchemas');

router.post('/register', validate({ body: registerBody }), authController.register);
router.post('/login', validate({ body: loginBody }), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
