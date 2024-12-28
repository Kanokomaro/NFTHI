const express = require("express");
const cors = require("cors");
const { getNFTsFromWallet, getNFTsFromCollection, getTopCollections } = require("./api");

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,POST",
};
app.use(cors(corsOptions));

app.use(express.json());

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por windowMs
});

app.use(limiter);

// Endpoint para buscar coleções populares
app.get("/api/collections", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const collections = await getTopCollections(page, limit);
    res.json(collections);
  } catch (error) {
    console.error("Erro ao buscar coleções:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
});

// Endpoint para buscar NFTs da carteira
app.post("/api/nfts/wallet", async (req, res) => {
  const { privateKey } = req.body;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  if (!privateKey) {
    return res.status(400).json({ error: "Chave privada é obrigatória." });
  }

  try {
    const nfts = await getNFTsFromWallet(privateKey, page, limit);
    res.json(nfts);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
});

// Endpoint para buscar NFTs de uma coleção
app.post("/api/nfts/collection", async (req, res) => {
  const { collectionSlug } = req.body;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  if (!collectionSlug) {
    return res.status(400).json({ error: "Slug da coleção é obrigatório." });
  }

  try {
    const nfts = await getNFTsFromCollection(collectionSlug, page, limit);
    res.json(nfts);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});