

const authService = require('../services/authService');
const logger = require('../config/logger');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await authService.loginUser(email, password);

        res.json({
            msg: 'Login exitoso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token
        });

    } catch (error) {
        if (error.message === 'Credenciales inválidas.') {
            return res.status(400).json({ msg: error.message });
        }
        
        logger.error(`Error en el login: ${error.message}`, { stack: error.stack });
        res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

module.exports = { login };