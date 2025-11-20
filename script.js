class Card {
  constructor({ name, year, description, category, image }) {
    this.name = name;
    this.year = Number(year); // Garante que o ano seja um número para ordenação
    this.description = description;
    this.category = category;
    this.image = image;
  }

  createHTMLElement() {
    const article = document.createElement("article");
    article.classList.add("card");

    const imageHtml = this.image
      ? `<div class="card-image-container"><img src="${this.image}" alt="Foto de ${this.name}" loading="lazy"></div>`
      : "";

    article.innerHTML = `
      ${imageHtml}
      <div class="card-category category-${this.category.toLowerCase()}">${
      this.category
    }</div>
      <div class="card-content">
          <h2>${this.name}</h2>
          <p>${this.year}</p>
          <p>${this.description}</p>
      </div>
    `;
    return article;
  }
}

class App {
  constructor(containerSelector) {
    // Seletores do DOM
    this.cardContainer = document.querySelector(containerSelector);
    this.searchForm = document.querySelector(".search-form");
    this.searchInput = document.querySelector("#search-input");
    this.filterNav = document.querySelector(".filter-nav");

    // Estado da aplicação
    this.allCards = []; // Guarda todos os cards, nunca é modificado após o load
    this.currentCategory = "all";
    this.searchTerm = "";
  }

  async loadData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      // Ordena os dados por ano (mais recente primeiro) antes de criar os cards
      data.sort((a, b) => b.year - a.year);
      this.allCards = data.map((item) => new Card(item));
    } catch (error) {
      console.error("Erro ao carregar os dados:", error);
    }
  }

  render(cardsToRender) {
    this.cardContainer.innerHTML = ""; // Limpa o container antes de renderizar
    if (cardsToRender.length === 0) {
      this.cardContainer.innerHTML = `<p class="no-results">Nenhum resultado encontrado.</p>`;
    }
    cardsToRender.forEach((card) => {
      this.cardContainer.appendChild(card.createHTMLElement());
    });
  }

  addEventListeners() {
    // Evento para busca (em tempo real)
    this.searchInput.addEventListener("input", (event) => {
      this.searchTerm = event.target.value.toLowerCase();
      this.filterAndRender();
    });

    // Previne o formulário de recarregar a página
    this.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    // Evento para os botões de filtro de categoria
    this.filterNav.addEventListener("click", (event) => {
      if (event.target.classList.contains("filter-btn")) {
        const category = event.target.dataset.category;
        this.currentCategory = category;

        // Atualiza a classe 'active' nos botões
        this.filterNav.querySelector(".active").classList.remove("active");
        event.target.classList.add("active");

        this.filterAndRender();
      }
    });
  }

  filterAndRender() {
    let filteredCards = [...this.allCards];

    // 1. Filtra por categoria
    if (this.currentCategory !== "all") {
      filteredCards = filteredCards.filter(
        (card) => card.category === this.currentCategory
      );
    }

    // 2. Filtra pelo termo de busca (nome do piloto ou ano)
    if (this.searchTerm) {
      filteredCards = filteredCards.filter(
        (card) =>
          card.name.toLowerCase().includes(this.searchTerm) ||
          card.year.toString().includes(this.searchTerm)
      );
    }

    this.render(filteredCards);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App(".card-container");
  app.addEventListeners(); // Configura os eventos
  await app.loadData("data.json");
  app.filterAndRender(); // Renderização inicial
});
