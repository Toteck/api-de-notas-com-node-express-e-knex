// importação da conexão com o banco de dados
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");
const { compare } = require("bcryptjs");
const knex = require("../database/knex");
const { sign } = require("jsonwebtoken");

class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    // Procura o usuário no banco de dados
    const user = await knex("users").where({ email }).first();

    // Se usuário não existe lançe uma exceção
    if (!user) {
      throw new AppError("E-mail e/ou senha incorretos", 401);
    }

    // Verifica se a senha está correta
    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("E-mail e/ou senha incorretos", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn,
    });

    return response.json({ user, token });
  }
}

module.exports = SessionsController;
