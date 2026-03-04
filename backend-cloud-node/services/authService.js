const User = require('../models/User');
const Store = require('../models/Store');
const generateToken = require('../utils/generateToken');

class AuthService {
  async registerStore(storeName, userName, email, password) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error('E-mail já está em uso.');
    }

    const store = await Store.create({ name: storeName });

    const user = new User({
      storeId: store._id,
      name: userName,
      email,
      password,
      role: 'technician'
    });
    
    await user.save();

    return {
      storeId: store._id,
      userId: user._id,
      token: generateToken(user._id, store._id, user.role)
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).populate('storeId');
    if (!user) {
      throw new Error('Credenciais inválidas.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Credenciais inválidas.');
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.storeId
      },
      token: generateToken(user._id, user.storeId._id, user.role)
    };
  }
}

module.exports = new AuthService();
