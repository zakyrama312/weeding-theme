const fs = require('fs');
const path = require('path');

const dir = '/home/zaky/Documents/weeding/themes/special';
const files = ['bali.html', 'blue-flowers.html', 'butterfly.html', 'wayang.html'];

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Replace hero image (usually the first one, or around "Foto Pasangan")
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*alt="Foto Pasangan"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_1.jpeg'));

    // Replace Save the date or floating image (no alt usually, just src="../pasangan.jpeg")
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_2.jpeg'));

    // Replace Bride
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*alt="(Ayu Lestari|Anak Agung Gede)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_cewe.jpeg'));

    // Replace Groom
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*alt="(Bagas Pratama|Gusti Ayu Putu)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_cowo.jpeg'));

    // Replace main gallery img
    content = content.replace(/<img id="mainGalleryImg"[^>]*src="\.\.\/pasangan\.jpeg"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_1.jpeg'));

    // Replace gallery thumbnails
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*onclick="setGallery\(0\)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_1.jpeg'));
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*onclick="setGallery\(1\)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_2.jpeg'));
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*onclick="setGallery\(2\)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_3.jpeg'));
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*onclick="setGallery\(3\)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_1.jpeg'));
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*onclick="setGallery\(4\)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_2.jpeg'));
    content = content.replace(/<img[^>]*src="\.\.\/pasangan\.jpeg"[^>]*onclick="setGallery\(5\)"[^>]*>/, match => match.replace('../pasangan.jpeg', '../../assets/foto/pengantin_3.jpeg'));

    // Replace JS array
    content = content.replace(/const galleryImages = \['pasangan\.jpeg','pasangan\.jpeg','pasangan\.jpeg','pasangan\.jpeg','pasangan\.jpeg','pasangan\.jpeg'\];/, "const galleryImages = ['../../assets/foto/pengantin_1.jpeg','../../assets/foto/pengantin_2.jpeg','../../assets/foto/pengantin_3.jpeg','../../assets/foto/pengantin_1.jpeg','../../assets/foto/pengantin_2.jpeg','../../assets/foto/pengantin_3.jpeg'];");
    
    // Some use '../pasangan.jpeg' in JS array
    content = content.replace(/const galleryImages = \['\.\.\/pasangan\.jpeg','\.\.\/pasangan\.jpeg','\.\.\/pasangan\.jpeg','\.\.\/pasangan\.jpeg','\.\.\/pasangan\.jpeg','\.\.\/pasangan\.jpeg'\];/, "const galleryImages = ['../../assets/foto/pengantin_1.jpeg','../../assets/foto/pengantin_2.jpeg','../../assets/foto/pengantin_3.jpeg','../../assets/foto/pengantin_1.jpeg','../../assets/foto/pengantin_2.jpeg','../../assets/foto/pengantin_3.jpeg'];");

    fs.writeFileSync(path.join(dir, file), content);
});
console.log('Images replaced!');
