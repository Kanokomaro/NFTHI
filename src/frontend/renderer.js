const fetchWalletNFTsButton = document.getElementById("fetchWalletNFTs");
const walletNFTsDiv = document.getElementById("walletNFTs");
const collectionsGrid = document.getElementById("collectionsGrid");
const privateKeyForm = document.getElementById("privateKeyForm");
const homeButton = document.getElementById("homeButton");
const addPrivateKeyButton = document.getElementById("addPrivateKeyButton");
const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");
const toggleMenuButton = document.getElementById("toggleMenuButton");
const menuContent = document.getElementById("menuContent");
const searchInput = document.getElementById("collectionSearch");

// Estado global
let currentPage = 0;
let isLoading = false;
let hasMore = true;

// Função para mostrar loading
function showLoading() {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>
  `;
  document.body.appendChild(loader);
}

// Função para esconder loading
function hideLoading() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.remove();
  }
}

// Função para carregar as coleções populares
async function loadTopCollections(page = 0, append = false) {
  if (isLoading) return;
  
  try {
    isLoading = true;
    showLoading();

    const response = await fetch(`http://127.0.0.1:3000/api/collections?page=${page}&limit=10`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const collections = data.collections;
    
    hasMore = collections.length === 10;

    if (!append) {
      collectionsGrid.innerHTML = "";
    }

    collections.forEach(collection => {
      const collectionDiv = document.createElement("div");
      collectionDiv.classList.add("nft-card");

      const image = collection.image_url || "/api/placeholder/400/400";
      const name = collection.name || "Unnamed Collection";
      const oneDayChange = collection.one_day_change || 0;

      collectionDiv.innerHTML = `
        <img src="${image}" alt="${name}" onerror="this.src='/api/placeholder/400/400'">
        <div class="collection-info">
          <p class="collection-name">${name}</p>
          <p class="collection-stats">24h: ${oneDayChange.toFixed(2)}%</p>
        </div>
      `;

      collectionsGrid.appendChild(collectionDiv);
    });

  } catch (error) {
    console.error("Erro ao carregar coleções:", error);
    collectionsGrid.innerHTML = `<p class="error-message">Erro ao carregar coleções: ${error.message}</p>`;
  } finally {
    isLoading = false;
    hideLoading();
  }
}

// Infinit scroll
function handleScroll() {
  if (isLoading || !hasMore) return;

  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 100) {
    currentPage++;
    loadTopCollections(currentPage, true);
  }
}

// Event Listeners
window.addEventListener('scroll', handleScroll);

homeButton.addEventListener("click", () => {
  currentPage = 0;
  hasMore = true;
  privateKeyForm.style.display = "none";
  collectionsGrid.style.display = "grid";
  pageTitle.innerText = "Coleções Populares";
  loadTopCollections(0, false);
});

searchInput.addEventListener("input", debounce(async (e) => {
  const searchQuery = e.target.value;
  currentPage = 0;
  if (searchQuery) {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/nfts/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionSlug: searchQuery }),
      });
      const nfts = await response.json();
      displayNFTs(nfts, false);
    } catch (error) {
      console.error("Erro na busca:", error);
    }
  } else {
    loadTopCollections(0, false);
  }
}, 500));

// Função de debounce para evitar muitas requisições
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Carregar coleções iniciais quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  loadTopCollections(0, false);
});