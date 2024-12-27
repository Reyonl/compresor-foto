// Backend untuk Photo Compressor
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json({ limit: '10mb' }));

// Folder untuk penyimpanan sementara
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder); // Buat folder 'uploads' jika belum ada
}

// Konfigurasi Multer untuk penyimpanan sementara
const upload = multer({
  dest: uploadFolder,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal ukuran file 5MB
});

// Endpoint untuk kompresi gambar
app.post('/compress', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = Buffer.from(req.body.image.split(',')[1], 'base64');

    // Buat nama file untuk gambar terkompresi
    const compressedImagePath = path.join(uploadFolder, `compressed_${Date.now()}.jpg`);

    // Proses kompresi gambar
    await sharp(imageBuffer)
      .resize(800) // Resize jika ingin
      .jpeg({ quality: 70 }) // Kompres dengan kualitas 70
      .toFile(compressedImagePath);

    // Konversi gambar terkompresi ke Base64
    const compressedImageBase64 = fs.readFileSync(compressedImagePath, 'base64');

    // Hapus file sementara
    fs.unlinkSync(compressedImagePath);

    // Kirim hasil kompresi ke frontend
    res.json({
      compressedImage: `data:image/jpeg;base64,${compressedImageBase64}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Image compression failed.');
  }
});

// Endpoint default untuk pengecekan API
app.get('/', (req, res) => {
  res.send('Welcome to the Photo Compression API!');
});

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
