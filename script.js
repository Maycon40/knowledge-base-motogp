class Card {
  constructor({
    name,
    year,
    description,
    category,
    image,
    nationality,
    team,
    wins,
    podiums,
    poles,
  }) {
    this.name = name;
    this.year = Number(year); // Garante que o ano seja um número para ordenação
    this.description = description;
    this.category = category;
    this.image = image;
    this.nationality = nationality;
    this.team = team;
    this.wins = wins;
    this.podiums = podiums;
    this.poles = poles;
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
          <p class="nationality">${this.nationality}</p>
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
    this.layoutSwitcher = document.querySelector(".layout-switcher");
    this.nationalityFilter = document.querySelector("#nationality-filter");
    this.detailedContainer = document.querySelector(".detailed-container");
    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");

    // Estado da aplicação
    this.allCards = []; // Guarda todos os cards, nunca é modificado após o load
    this.filteredCards = [];
    this.currentLayout = "grid"; // 'grid' or 'detailed'
    this.detailedViewIndex = 0;

    this.isScrolling = false; // Flag para controlar o scroll
    // Estado dos filtros
    this.currentCategory = "all";
    this.currentNationality = "all";
    this.searchTerm = "";
  }

  async loadData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      // Ordena os dados por ano (mais recente primeiro) antes de criar os cards
      data.sort((a, b) => b.year - a.year);
      this.allCards = data.map((item) => new Card(item));
      this.populateNationalityFilter();
    } catch (error) {
      console.error("Erro ao carregar os dados:", error);
    }
  }

  render(cardsToRender) {
    this.cardContainer.innerHTML = ""; // Limpa o container antes de renderizar
    if (this.filteredCards.length === 0) {
      this.cardContainer.innerHTML = `<p class="no-results">Nenhum resultado encontrado.</p>`;
      this.detailedContainer.innerHTML = `<p class="no-results">Nenhum resultado encontrado.</p>`;
      return;
    }

    if (this.currentLayout === "grid") {
      this.filteredCards.forEach((card) => {
        this.cardContainer.appendChild(card.createHTMLElement());
      });
    } else if (this.filteredCards.length > 0) {
      this.renderDetailedView();
    }
  }

  renderDetailedView() {
    const card = this.filteredCards[this.detailedViewIndex];
    if (!card) return;

    this.detailedContainer.innerHTML = ""; // Limpa o container
    this.detailedContainer.appendChild(this.createDetailedViewElement(card));
    const imageHtml = card.image
      ? `<div class="card-image-container"><img src="${card.image}" alt="Foto de ${card.name}" loading="lazy"></div>`
      : "";

    this.detailedContainer.innerHTML = `
      <div class="detailed-view">
        ${imageHtml}
        <div class="card-content">
          <div class="card-header">
            <div>
              <h2>${card.name}</h2>
              <p class="nationality">${card.nationality}</p>
            </div>
            <div class="card-category category-${card.category.toLowerCase()}">${
      card.category
    }</div>
          </div>
          <p><strong>${card.year}</strong> - ${card.team}</p>
          
          <div class="detailed-stats">
            <div class="stat">
              <span class="stat-value">${card.wins}</span>
              <span class="stat-label">Vitórias</span>
            </div>
            <div class="stat">
              <span class="stat-value">${card.podiums}</span>
              <span class="stat-label">Pódios</span>
            </div>
            <div class="stat">
              <span class="stat-value">${card.poles}</span>
              <span class="stat-label">Poles</span>
            </div>
          </div>

          <p>${card.description}</p>
        </div>
      </div>`;
    this.updateNavButtons();
  }

  populateNationalityFilter() {
    const nationalities = [
      ...new Set(this.allCards.map((card) => card.nationality)),
    ];
    nationalities.sort(); // Ordena alfabeticamente
    nationalities.forEach((nationality) => {
      const option = document.createElement("option");
      option.value = nationality;
      option.textContent = nationality;
      this.nationalityFilter.appendChild(option);
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

        const filterGroup = event.target.closest(".filter-group");

        // Atualiza a classe 'active' nos botões
        filterGroup.querySelector(".active").classList.remove("active");
        event.target.classList.add("active");

        this.filterAndRender();
      }
    });

    // Evento para o filtro de nacionalidade
    this.nationalityFilter.addEventListener("change", (event) => {
      this.currentNationality = event.target.value;
      this.filterAndRender();
    });

    // Evento para trocar de layout
    this.layoutSwitcher.addEventListener("click", (event) => {
      if (event.target.classList.contains("layout-btn")) {
        const layout = event.target.dataset.layout;
        if (this.currentLayout === layout) return;

        this.currentLayout = layout;

        this.layoutSwitcher.querySelector(".active").classList.remove("active");
        event.target.classList.add("active");

        this.toggleLayout();
      }
    });

    // Evento de scroll para o layout de detalhes
    window.addEventListener(
      "wheel",
      (event) => {
        if (this.currentLayout !== "detailed" || this.isScrolling) {
          return;
        }

        // Previne o scroll padrão da página apenas no modo detalhado
        event.preventDefault();

        this.isScrolling = true;

        if (event.deltaY > 0) {
          // Scroll para baixo
          this.navigateDetailedView(1);
        } else {
          // Scroll para cima
          this.navigateDetailedView(-1);
        }
        setTimeout(() => (this.isScrolling = false), 800); // Duração da animação + um buffer
      },
      { passive: false }
    ); // Necessário para poder usar preventDefault

    // Eventos para os botões de navegação de detalhes
    this.prevBtn.addEventListener("click", () => this.navigateDetailedView(-1));
    this.nextBtn.addEventListener("click", () => this.navigateDetailedView(1));
  }

  toggleLayout() {
    if (this.currentLayout === "grid") {
      this.cardContainer.classList.remove("hidden");
      this.detailedContainer.classList.add("hidden");
      document.body.classList.remove("detailed-layout-active");
    } else {
      this.cardContainer.classList.add("hidden");
      this.detailedContainer.classList.remove("hidden");
      document.body.classList.add("detailed-layout-active");
    }
    // Garante que o primeiro card seja renderizado ao trocar para o modo de detalhes
    this.detailedViewIndex = 0;
    this.render();
  }

  filterAndRender() {
    let tempFiltered = [...this.allCards];

    // 1. Filtra por categoria
    if (this.currentCategory !== "all") {
      tempFiltered = tempFiltered.filter(
        (card) => card.category === this.currentCategory
      );
    }

    // 2. Filtra por nacionalidade
    if (this.currentNationality !== "all") {
      tempFiltered = tempFiltered.filter(
        (card) => card.nationality === this.currentNationality
      );
    }

    // 2. Filtra pelo termo de busca (nome do piloto ou ano)
    if (this.searchTerm) {
      tempFiltered = tempFiltered.filter(
        (card) =>
          card.name.toLowerCase().includes(this.searchTerm) ||
          card.year.toString().includes(this.searchTerm)
      );
    }

    this.filteredCards = tempFiltered;
    this.detailedViewIndex = 0; // Reseta o índice ao filtrar
    this.render();
  }

  navigateDetailedView(direction) {
    const newIndex = this.detailedViewIndex + direction;
    if (newIndex < 0 || newIndex >= this.filteredCards.length) {
      this.isScrolling = false; // Libera o scroll se chegar no limite
      return; // Não faz nada se estiver no início ou no fim
    }

    const currentView = this.detailedContainer.querySelector(".detailed-view");

    // Aplica animação de saída
    if (currentView) {
      const animationOutClass =
        direction > 0 ? "slide-out-left" : "slide-out-right";
      currentView.classList.add(animationOutClass);
      // Remove o elemento antigo após a animação
      currentView.addEventListener("animationend", () => {
        currentView.remove();
      });
    }

    // Cria e anima o novo card
    this.detailedViewIndex = newIndex;
    const nextCardData = this.filteredCards[this.detailedViewIndex];
    const newView = this.createDetailedViewElement(nextCardData);

    const animationInClass = direction > 0 ? "slide-in-right" : "slide-in-left";
    newView.classList.add(animationInClass);

    this.detailedContainer.appendChild(newView);
    this.updateNavButtons();
  }

  // Função auxiliar para criar o elemento do detailed-view (evita duplicação de código)
  createDetailedViewElement(card) {
    const detailedView = document.createElement("div");
    detailedView.className = "detailed-view";
    // Reutiliza a lógica de criação de HTML do renderDetailedView, mas sem o append
    // (O conteúdo foi simplificado para caber aqui, mas a lógica é a mesma)
    const imageHtml = card.image
      ? `<div class="card-image-container"><img src="${card.image}" alt="Foto de ${card.name}"></div>`
      : "";
    detailedView.innerHTML = `${imageHtml}<div class="card-content">...</div>`; // Conteúdo omitido por brevidade
    detailedView.innerHTML = this.getDetailedViewHTML(card); // Usa uma função para gerar o HTML
    return detailedView;
  }

  updateNavButtons() {
    this.prevBtn.disabled = this.detailedViewIndex === 0;
    this.nextBtn.disabled =
      this.detailedViewIndex === this.filteredCards.length - 1;
  }

  // Separa a geração de HTML para ser reutilizável
  getDetailedViewHTML(card) {
    const imageHtml = card.image
      ? `<div class="card-image-container"><img src="${card.image}" alt="Foto de ${card.name}" loading="lazy"></div>`
      : "";
    return `
      ${imageHtml}
      <div class="card-content">
        <div class="card-header">
          <div>
            <h2>${card.name}</h2>
            <p class="nationality">${card.nationality}</p>
          </div>
          <div class="card-category category-${card.category.toLowerCase()}">${
      card.category
    }</div>
        </div>
        <p><strong>${card.year}</strong> - ${card.team}</p>
        <div class="detailed-stats">
          <div class="stat"><span class="stat-value">${
            card.wins
          }</span><span class="stat-label">Vitórias</span></div>
          <div class="stat"><span class="stat-value">${
            card.podiums
          }</span><span class="stat-label">Pódios</span></div>
          <div class="stat"><span class="stat-value">${
            card.poles
          }</span><span class="stat-label">Poles</span></div>
        </div>
        <p>${card.description}</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App(".card-container");
  await app.loadData("data.json");
  app.addEventListeners(); // Configura os eventos da app principal
  app.filterAndRender(); // Renderização inicial

  // Inicializa o chatbot com os dados carregados
  try {
    const { Chatbot } = await import("./chat.js");

    new Chatbot(app.allCards.map((card) => ({ ...card })));
  } catch (error) {
    console.error("Erro ao inicializar o chatbot:", error);
  }
});
