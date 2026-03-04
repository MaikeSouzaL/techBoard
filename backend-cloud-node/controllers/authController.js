const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { storeName, userName, email, password } = req.body;
      const result = await authService.registerStore(storeName, userName, email, password);
      res.status(201).json({
        message: 'Loja e Usuário criados com sucesso!',
        ...result
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
