require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Caminho da chave
const keyPath = path.join(__dirname, "key.json");

// Conexão com o bucket
const storage = new Storage({
  keyFilename: keyPath,
});

const bucketName = "leaftime-maps-mateus"; // <-- SEU BUCKET
const bucket = storage.bucket(bucketName);

console.log("Conectado ao bucket:", bucketName);

// Rota para baixar arquivos do bucket
app.get("/dados", async (req, res) => {
  try {
    const fileName = req.query.file;

    if (!fileName) {
      return res.status(400).json({ erro: "Informe ?file=nome.ext" });
    }

    console.log("📥 Buscando arquivo:", fileName);

    const file = bucket.file(fileName);

    const [contents] = await file.download();

    res.setHeader("Content-Type", "application/json");
    res.send(contents.toString());
  } catch (error) {
    console.error("Erro ao buscar do bucket:", error);
    res.status(500).json({ erro: "Erro ao acessar arquivo no bucket" });
  }
});

app.listen(3000, () =>
  console.log("API rodando na porta 3000")
);
