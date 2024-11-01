const sqliteConnection = require("../database/sqlite");

class UserRepository {
  async findByEmail(email) {
    // Conectar com o banco de dados
    const database = await sqliteConnection();

    // Busca o usuário
    const user = await database.get("SELECT * FROM users WHERE email = (?)", [
      email,
    ]);

    return user;
  }

  async create({ name, email, password }) {
    const database = await sqliteConnection();

    const userId = await database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    return { id: userId };
  }
}

module.exports = UserRepository;
