const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    // Conectar com o banco de dados
    const database = await sqliteConnection();

    // Busca o usuário
    const checkUserExists = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso.");
    }

    // criptografando senha
    const hashedPassword = await hash(password, 8);

    // Criando o usuário
    await database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return response.status(201).json({});
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    // Pega o ID passado por parâmetro
    const { id } = request.params;

    const database = await sqliteConnection();
    // Procura um usuário existente com o ID
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

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
      [user.name, user.email, user.password, id]
    );

    return response.json();
  }
}

module.exports = UsersController;