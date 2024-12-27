// Backend untuk Photo Compressor
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware untuk parsing JSON
app.use(express.json({ limit: '10mb' }));

// Tempat penyimpanan sementara
const upload = multer({ dest: 'uploads/' });

// Endpoint compress
app.post('/compress', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = Buffer.from(req.body.image.split(",")[1], 'base64');

    const compressedImagePath = `compressed_${Date.now()}.jpg`;

    await sharp(imageBuffer)
      .resize(800) // Resize jika ingin
      .jpeg({ quality: 70 }) // Kompres dengan kualitas 70
      .toFile(compressedImagePath);

    const compressedImageBase64 = fs.readFileSync(compressedImagePath, 'base64');

    // Hapus file sementara
    fs.unlinkSync(compressedImagePath);

    res.json({
      compressedImage: `data:image/jpeg;base64,${compressedImageBase64}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Image compression failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on https://compresfoto.tplp4.com:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Photo Compression API!');
  });
  
app.use(express.static(path.join(__dirname, 'public')));
