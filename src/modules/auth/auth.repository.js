const { User } = require('../../database/models');

const PUBLIC_ATTRS = ['id', 'username', 'email', 'role', 'createdAt'];

class AuthRepository {
  async findUserByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findUserByUsername(username) {
    return User.findOne({ where: { username } });
  }

  async createUser(data) {
    const user = await User.create(data);
    return User.findByPk(user.id, { attributes: PUBLIC_ATTRS });
  }

  async findUserById(id) {
    return User.findByPk(id, { attributes: PUBLIC_ATTRS });
  }
}

module.exports = new AuthRepository();
