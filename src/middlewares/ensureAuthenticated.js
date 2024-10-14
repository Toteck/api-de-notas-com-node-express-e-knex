const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT Token não informado", 401);
  }

  // Extraímos o token do cabeçalho
  const [, token] = authHeader.split(" ");

  // Verifica se é um token válido
  try {
    // sub: é o id do usuário e por isso eu criei um aliás para ela
    const { sub: user_id } = verify(token, authConfig.jwt.secret);

    // criando uma propriedade para request
    request.user = {
      id: Number(user_id),
    };

    return next();
  } catch {
    throw new AppError("JWT Token inválido", 401);
  }
}

module.exports = ensureAuthenticated;
