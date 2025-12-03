// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { Storage } = require('@google-cloud/storage');
const { parseCsv } = require('./utils/parseCsv');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

const bucketName = process.env.BUCKET_NAME || 'SEU_BUCKET';
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './key.json'
});
const bucket = storage.bucket(bucketName);

// lê um arquivo JSON, CSV ou GeoJSON e retorna array de pontos
async function readFileFromBucket(filePath) {
  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  if (!exists) throw new Error('Arquivo não encontrado no bucket: ' + filePath);
  const [contents] = await file.download();
  const text = contents.toString('utf8');

  if (filePath.endsWith('.json')) {
    // pode ser GeoJSON ou JSON simples
    const parsed = JSON.parse(text);
    // se for GeoJSON -> converter
    if (parsed.type && parsed.type === 'FeatureCollection') {
      const points = [];
      parsed.features.forEach(f => {
        const coords = f.geometry && f.geometry.coordinates;
        if (coords && (f.geometry.type === 'Point')) {
          points.push({
            nome: (f.properties && f.properties.name) || f.properties?.nome || 'Ponto',
            latitude: coords[1],
            longitude: coords[0],
            props: f.properties || {}
          });
        }
      });
      return points;
    }
    // caso JSON já seja array de objetos com latitude/longitude:
    if (Array.isArray(parsed)) return parsed;
    // fallback: transformar objeto em array
    return [parsed];
  } else if (filePath.endsWith('.csv')) {
    return parseCsv(text); // função utilitária
  } else {
    throw new Error('Formato de arquivo não suportado. Use .json/.geojson/.csv');
  }
}

app.get('/dados', async (req, res) => {
  try {
    // Exemplo: permitir ?file=pasta/dados.json
    const file = req.query.file || 'dados.json';
    const pontos = await readFileFromBucket(file);
    res.json(pontos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
