const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");

const imageDirectories = {
    dish: "dishes",
    profile: "profiles"
};

async function optimizeImage(buffer, type) {
    const subdirectory = imageDirectories[type];
    if (!subdirectory) {
        throw new Error("Tipo de imagem não suportado");
    }

    const filename = `${crypto.randomUUID()}.webp`;
    const directory = path.resolve(process.cwd(), "uploads", subdirectory);

    await fs.mkdir(directory, { recursive: true });

    const filePath = path.join(directory, filename);
    await sharp(buffer)
        .rotate()
        .resize({
            width: 800,
            withoutEnlargement: true
        })
        .webp({
            quality: 80
        })
        .toFile(filePath);

    return `/uploads/${subdirectory}/${filename}`;
}

module.exports = {
    optimizeImage
};
