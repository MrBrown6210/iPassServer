import sharp from 'sharp';
import uuidv4 from 'uuid/v4';
import path from 'path';

// const sharp = require('sharp');
// const uuidv4 = require('uuid/v4');
// const path = require('path');

class Resize {
    folder: string = '';
    width: number = 640;
    height: number = 640;
    fit: string = 'inside';

    constructor(folder) {
        this.folder = folder;
    }
    async save(buffer) {
        const filename = Resize.filename();
        const filepath = this.filepath(filename);
        await sharp(buffer)
            .resize(300, 300, {
                fit: sharp.fit.inside,
                withoutEnlargement: true,
            })
            .toFile(filepath);
        return filename;
    }
    static filename() {
        return `${uuidv4()}.png`;
    }
    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`);
    }
}
export default Resize;
