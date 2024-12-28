const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = "https://api.opensea.io/v2";
const API_KEY = process.env.OPENSEA_API_KEY;

const headers = {
  "X-API-KEY": API_KEY,
  "accept": "application/json"
};

// Rate limiting configuration
const REQUESTS_PER_SECOND = 2;
const queue = [];
let lastRequestTime = Date.now();

// Helper function for rate limiting
const rateLimitedRequest = async (config) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minRequestInterval = 1000 / REQUESTS_PER_SECOND;

  if (timeSinceLastRequest < minRequestInterval) {
    await new Promise(resolve => setTimeout(resolve, minRequestInterval - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  return axios(config);
};

// Função para buscar coleções populares
async function getTopCollections(page = 0, limit = 10) {
  try {
    const response = await rateLimitedRequest({
      method: 'GET',
      url: `${API_BASE_URL}/collections`,
      headers,
      params: {
        chain: 'ethereum',
        limit: limit,
        offset: page * limit,
        order_by: 'one_day_change'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter coleções:", error.message);
    if (error.response?.status === 429) {
      throw new Error("Limite de taxa atingido. Tente novamente em alguns minutos.");
    }
    throw error;
  }
}

// Função para buscar NFTs de uma coleção
async function getNFTsFromCollection(collectionSlug, page = 0, limit = 10) {
  try {
    const response = await rateLimitedRequest({
      method: 'GET',
      url: `${API_BASE_URL}/assets`,
      headers,
      params: {
        collection: collectionSlug,
        limit: limit,
        offset: page * limit,
        order_direction: "desc",
        order_by: "price"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar NFTs da coleção:", error.message);
    if (error.response?.status === 429) {
      throw new Error("Limite de taxa atingido. Tente novamente em alguns minutos.");
    }
    throw error;
  }
}

// Função para buscar NFTs da carteira
async function getNFTsFromWallet(address, page = 0, limit = 10) {
  try {
    const response = await rateLimitedRequest({
      method: 'GET',
      url: `${API_BASE_URL}/chain/ethereum/account/${address}/nfts`,
      headers,
      params: {
        limit: limit,
        offset: page * limit
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar NFTs da carteira:", error.message);
    if (error.response?.status === 429) {
      throw new Error("Limite de taxa atingido. Tente novamente em alguns minutos.");
    }
    throw error;
  }
}

module.exports = {
  getTopCollections,
  getNFTsFromCollection,
  getNFTsFromWallet
};