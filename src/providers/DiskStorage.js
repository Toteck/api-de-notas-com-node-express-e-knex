const fs = require("fs");
const path = require("path");
const uploadConfig = require("../configs/upload");

class DiskStorage {
  async saveFile(file) {
    // fs.promises.rename: Mudar o arquivo de lugar
    await fs.promises.rename(
      path.resolve(uploadConfig.TMP_FOLDER, file),
      path.resolve(uploadConfig.UPLOADS_FOLDER, file)
    );

    return file;
  }

  async deleteFile(file) {
    // Buscando pelo arquivo na pasta de uploads
    const filePath = path.resolve(uploadConfig.UPLOADS_FOLDER, file);
    try {
      // fs.promises.stat: Verifica se o arquivo existe no caminho especificado
      await fs.promises.stat(filePath);
    } catch (error) {
      return;
    }

    // fs.promises.unlink: Deleta o arquivo
    await fs.promises.unlink(filePath);
  }
}

module.exports = DiskStorage;
