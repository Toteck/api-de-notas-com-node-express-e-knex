const knex = require("../database/knex");
const AppErro = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class UserAvatarController {
  async update(request, response) {
    // pega o id do usuário e o nome do arquivo
    const user_id = request.user.id;
    const avatarFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const user = await knex("users").where({ id: user_id }).first();

    // // verifica se o usuário não existe
    if (!user) {
      throw new AppError(
        "Somente usuários autenticados podem mudar o avatar",
        401
      );
    }

    // // Se já existir uma foto de avatar deleta-a
    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar);
    }

    // // Salva que foi feito o upload

    const fileName = await diskStorage.saveFile(avatarFilename);

    user.avatar = fileName;

    // Salva no banco de dados a novo foto de perfil
    await knex("users").update(user).where({ id: user_id });

    // Retorna o usuário com a foto atualizada
    return response.json(user);
  }
}

module.exports = UserAvatarController;
