// importação da conexão com o banco de dados
const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    // Procura o usuário no banco de dados
    const user = await knex("users").where({ email }).first();

    // Se usuário não existe lançe uma exceção
    if (!user) {
      throw new AppError("E-mail e/ou senha incorretos", 401);
    }

    return response.json(user);
  }
}

module.exports = SessionsController;
