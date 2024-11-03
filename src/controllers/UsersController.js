const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite");
const UserRepository = require("../repositories/UserRepository");
const UserCreateService = require("../services/UserCreateService");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const userRepository = new UserRepository();
    const userCreateService = new UserCreateService(userRepository);

    await userCreateService.execute({ name, email, password });

    return response.status(201).json({});
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const user_id = request.user.id;

    const database = await sqliteConnection();
    // Procura um usuário existente com o ID
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [
      user_id,
    ]);

    // Se não existir usuário dá erro
    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    // Verifica se o email que está sendo atualizado já existe
    const userWithUpdatedEmail = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    // Tentando atualizar o email que já pertence a alguém
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso.");
    }

    // Atualização dos dados
    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga");
    }

    if (password && old_password) {
      const checkPassword = await compare(old_password, user.password);

      if (!checkPassword) {
        throw new AppError("A senha antiga não confere.");
      }

      user.password = await hash(password, 8);
    }

    await database.run(
      `
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?
      `,
      [user.name, user.email, user.password, user_id]
    );

    return response.json();
  }
}

module.exports = UsersController;
