const { ethers } = require("ethers");
const axios = require("axios");
require('dotenv').config();

const API_BASE_URL = "https://api.opensea.io/v2";
const API_KEY = process.env.OPENSEA_API_KEY;

const headers = {
  "X-API-KEY": API_KEY,
};

async function getNFTsFromWallet(privateKey) {
  try {
    // Conectar ao provedor Ethereum
    const provider = ethers.getDefaultProvider("mainnet");
    const wallet = new ethers.Wallet(privateKey, provider);

    // Obter endereço da carteira
    const address = wallet.address;

    // Consultar NFTs via OpenSea API
    const response = await axios.get(`${API_BASE_URL}/chain/ethereum/account/${address}/nfts`, {
      headers,
    });

    return response.data.nfts || [];
  } catch (error) {
    console.error("Erro ao buscar NFTs da carteira:", error.message);
    throw error;
  }
}

// Nova função para buscar NFTs de uma coleção
async function getNFTsFromCollection(collectionSlug) {
  try {
    const response = await axios.get(`${API_BASE_URL}/assets`, {
      headers,
      params: {
        order_direction: "desc",
        order_by: "price",
        offset: "0",
        limit: "10",
        collection: collectionSlug,  // Alterado para usar a coleção
      }
    });
    return response.data.assets;
  } catch (error) {
    console.error("Erro ao buscar NFTs da coleção:", error.message);
    throw error;
  }
}

module.exports = { getNFTsFromWallet, getNFTsFromCollection };
