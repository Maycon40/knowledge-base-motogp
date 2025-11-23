/** Classe que representa um único card de piloto. */
class Card {
  constructor(data, language = "pt") {
    const { name, year, category, image, team, wins, podiums, poles } = data;

    this.name = name;
    this.year = Number(year); // Garante que o ano seja um número para ordenação
    this.category = category;
    this.image = image;
    this.team = team;
    this.wins = wins;
    this.podiums = podiums;
    this.poles = poles;

    // Define as propriedades de idioma
    let langData;
    if (language === "pt") {
      langData = data.pt;
    } else if (language === "es") {
      langData = data.es;
    } else {
      langData = data.en;
    }
    this.description = langData.description;
    this.alt = langData.alt;
    this.nationality = langData.nationality;

    // Guarda os dados brutos para poder trocar de idioma
    this.rawData = data;
  }

  /** Cria e retorna o elemento HTML para o card. */
  createHTMLElement(language, translations) {
    const article = document.createElement("article");
    article.classList.add("card");

    const imageHtml = this.image
      ? `<div class="card-image-container"><img src="${this.image}" alt="${this.alt}" loading="lazy"></div>`
      : "";

    // Usando <figure> e <figcaption> para melhorar a semântica
    article.innerHTML = `
      <figure>
        ${imageHtml}
        <div class="card-category category-${this.category.toLowerCase()}">${
      this.category
    }</div>
        <figcaption class="card-content">
            <h2>${this.name}</h2>
            <p class="nationality">${this.nationality}</p>
            <p>${this.year}</p>
            <p>${this.description}</p>
        </figcaption>
      </figure>
    `;
    return article;
  }
}

/** Classe para gerenciar a troca de tema (claro/escuro). */
class ThemeSwitcher {
  constructor(buttonSelector) {
    this.themeToggleButton = document.querySelector(buttonSelector);
    this.body = document.body;
    this.iconElement = this.themeToggleButton.querySelector(
      ".material-symbols-outlined"
    );

    this.loadTheme();
    this.addEventListeners();
  }

  /** Carrega o tema salvo no localStorage ou define o padrão. */
  loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark"; // Padrão é escuro
    this.applyTheme(savedTheme);
  }

  /** Aplica o tema (claro ou escuro) ao body e atualiza o ícone. */
  applyTheme(theme) {
    if (theme === "light") {
      this.body.classList.add("light-theme");
      this.iconElement.textContent = "dark_mode"; // Ícone de lua
    } else {
      this.body.classList.remove("light-theme");
      this.iconElement.textContent = "light_mode"; // Ícone de sol
    }
    localStorage.setItem("theme", theme);
  }

  /** Adiciona o evento de clique ao botão de troca de tema. */
  addEventListeners() {
    this.themeToggleButton.addEventListener("click", () => {
      event.stopPropagation(); // Impede que o clique "vaze" para os botões de layout
      const currentTheme = this.body.classList.contains("light-theme")
        ? "light"
        : "dark";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      this.applyTheme(newTheme);
    });
  }
}

/** Classe para gerenciar a internacionalização (troca de idioma). */
class LanguageSwitcher {
  constructor(buttonSelector, appInstance) {
    this.langSelectElement = document.querySelector(buttonSelector);
    this.app = appInstance;
    this.currentLang = this.getInitialLang();
    this.translations = {
      pt: {
        main_title: "Campeões da Motovelocidade",
        search_placeholder: "Pesquise por piloto ou ano...",
        search_button: "Buscar",
        layout_cards: "Cards",
        layout_details: "Detalhes",
        filter_all_categories: "Todos",
        filter_nationality_label: "Filtrar por nacionalidade",
        filter_all_nationalities: "Todas as Nacionalidades",
        nav_prev_aria: "Anterior",
        nav_next_aria: "Próximo",
        footer_text:
          "&copy; 2025 Base de Conhecimento MotoGP. Todos os direitos reservados.",
        no_results: "Nenhum resultado encontrado.",
        stat_wins: "Vitórias",
        stat_podiums: "Pódios",
        stat_poles: "Poles",
      },
      en: {
        main_title: "Motorcycle Racing Champions",
        search_placeholder: "Search by rider or year...",
        search_button: "Search",
        layout_cards: "Cards",
        layout_details: "Details",
        filter_all_categories: "All",
        filter_nationality_label: "Filter by nationality",
        filter_all_nationalities: "All Nationalities",
        nav_prev_aria: "Previous",
        nav_next_aria: "Next",
        footer_text: "&copy; 2025 MotoGP Knowledge Base. All rights reserved.",
        no_results: "No results found.",
        stat_wins: "Wins",
        stat_podiums: "Podiums",
        stat_poles: "Poles",
      },
      es: {
        main_title: "Campeones de Motociclismo",
        search_placeholder: "Buscar por piloto o año...",
        search_button: "Buscar",
        layout_cards: "Tarjetas",
        layout_details: "Detalles",
        filter_all_categories: "Todos",
        filter_nationality_label: "Filtrar por nacionalidad",
        filter_all_nationalities: "Todas las Nacionalidades",
        nav_prev_aria: "Anterior",
        nav_next_aria: "Siguiente",
        footer_text:
          "&copy; 2025 Base de Conocimiento de MotoGP. Todos los derechos reservados.",
        no_results: "No se encontraron resultados.",
        stat_wins: "Victorias",
        stat_podiums: "Podios",
        stat_poles: "Poles",
      },
    };

    this.applyLanguage(this.currentLang);
    this.addEventListeners();
  }

  /** Aplica o idioma selecionado, atualizando o texto da UI. */
  applyLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("language", lang);
    this.langSelectElement.value = lang;

    document.querySelectorAll("[data-lang-key]").forEach((element) => {
      const key = element.dataset.langKey;
      if (this.translations[lang][key]) {
        // Trata os botões de navegação de forma especial para não substituir o ícone
        if (key === "nav_prev_aria" || key === "nav_next_aria") {
          element.setAttribute("aria-label", this.translations[lang][key]);
        } else {
          // Comportamento padrão para os outros elementos
          element.innerHTML = this.translations[lang][key];
        }
      }
    });
  }

  /** Obtém o idioma inicial do localStorage ou do navegador. */
  getInitialLang() {
    const savedLang = localStorage.getItem("language");
    if (savedLang) return savedLang;

    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "en") return "en";
    if (browserLang === "es") return "es";
    return "pt"; // Padrão
  }

  /** Adiciona o evento de mudança ao seletor de idioma. */
  addEventListeners() {
    this.langSelectElement.addEventListener("change", (event) => {
      const newLang = event.target.value;
      this.applyLanguage(newLang);
      this.app.onLanguageChange(newLang);
    });
  }
}

/** Classe principal da aplicação. Gerencia o estado, renderização e interações. */
class App {
  constructor(containerSelector) {
    // --- Seletores do DOM ---
    // Mapeia os elementos da interface para propriedades da classe.

    this.cardContainer = document.querySelector(containerSelector);
    this.searchForm = document.querySelector(".search-form");
    this.searchInput = document.querySelector("#search-input");
    this.filterNav = document.querySelector(".filter-nav");
    this.layoutSwitcher = document.querySelector(".layout-switcher");
    this.nationalityFilter = document.querySelector("#nationality-filter");
    this.detailedContainer = document.querySelector(".detailed-container");
    this.detailedCardContent = document.getElementById("detailed-card-content");
    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");

    // --- Estado da Aplicação ---
    // Guarda os dados e o estado atual dos filtros e layout.

    this.allData = []; // Guarda todos os dados brutos do JSON
    this.allCards = []; // Guarda todos os cards instanciados
    this.filteredCards = [];
    this.currentLayout = "grid"; // 'grid' or 'detailed'
    this.detailedViewIndex = 0;

    this.isScrolling = false; // Flag para controlar o scroll
    // Estado dos filtros
    this.currentCategory = "all";
    this.currentNationality = "all";
    this.searchTerm = "";

    // --- Módulos ---
    // Instancia as classes de ajuda para tema e idioma.
    this.languageSwitcher = new LanguageSwitcher("#lang-switcher", this);
    this.themeSwitcher = new ThemeSwitcher("#theme-switcher");
    this.currentLang = this.languageSwitcher.currentLang;
  }

  /** Carrega os dados dos campeões a partir de um arquivo JSON. */
  async loadData(url) {
    try {
      const response = await fetch(url);
      this.allData = await response.json();
      // Ordena os dados por ano (mais recente primeiro) antes de criar os cards
      this.allData.sort((a, b) => b.year - a.year);
      this.createCardInstances();
      this.populateNationalityFilter();
    } catch (error) {
      console.error("Erro ao carregar os dados:", error);
    }
  }

  /** Cria instâncias da classe Card para cada item de dado carregado. */
  createCardInstances() {
    this.allCards = this.allData.map(
      (item) => new Card(item, this.currentLang)
    );
  }

  /** Renderiza os cards na tela com base no layout e filtros atuais. */
  render() {
    this.cardContainer.innerHTML = ""; // Limpa o container antes de renderizar
    const noResultsText =
      this.languageSwitcher.translations[this.currentLang].no_results;

    if (this.filteredCards.length === 0) {
      this.cardContainer.innerHTML = `<p class="no-results">${noResultsText}</p>`;
      this.detailedCardContent.innerHTML = `<p class="no-results">${noResultsText}</p>`;
      return;
    }

    if (this.currentLayout === "grid") {
      this.filteredCards.forEach((card) => {
        this.cardContainer.appendChild(
          card.createHTMLElement(
            this.currentLang,
            this.languageSwitcher.translations
          )
        );
      });
    } else if (this.filteredCards.length > 0) {
      this.renderDetailedView();
    }
  }

  /** Renderiza a visualização detalhada para o card atualmente selecionado. */
  renderDetailedView() {
    const card = this.filteredCards[this.detailedViewIndex];
    if (!card) return;

    this.detailedCardContent.innerHTML = this.getDetailedViewHTML(card);
    this.updateNavButtons();
  }

  /** Popula o menu suspenso de filtro de nacionalidade com base nos dados carregados. */
  populateNationalityFilter() {
    const nationalities = [
      ...new Set(this.allCards.map((card) => card.nationality)),
    ].filter(Boolean); // Remove valores nulos/undefined
    nationalities.sort(); // Ordena alfabeticamente
    this.nationalityFilter
      .querySelectorAll('option:not([value="all"])')
      .forEach((o) => o.remove());
    nationalities.forEach((nationality) => {
      const option = document.createElement("option");
      option.value = nationality;
      option.textContent = nationality;
      this.nationalityFilter.appendChild(option);
    });
  }

  /** Adiciona todos os ouvintes de eventos para os elementos interativos da página. */
  addEventListeners() {
    this.searchInput.addEventListener("input", (event) => {
      this.searchTerm = event.target.value.toLowerCase();
      this.filterAndRender();
    });

    // Previne o formulário de recarregar a página
    this.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    // Filtro de categoria
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

    // Navegação por teclado nos filtros de categoria
    this.filterNav.addEventListener("keydown", (event) => {
      const target = event.target;
      // Verifica se o alvo é um botão de filtro de categoria
      if (
        !target.classList.contains("filter-btn") ||
        !target.dataset.category
      ) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); // Previne o scroll da página

        const categoryButtons = Array.from(
          this.filterNav.querySelectorAll(".filter-btn[data-category]")
        );
        const currentIndex = categoryButtons.indexOf(target);

        let nextIndex;
        if (event.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % categoryButtons.length;
        } else {
          // ArrowLeft
          nextIndex =
            (currentIndex - 1 + categoryButtons.length) %
            categoryButtons.length;
        }
        categoryButtons[nextIndex].focus(); // Move o foco para o próximo botão
      }
    });

    // Filtro de nacionalidade
    this.nationalityFilter.addEventListener("change", (event) => {
      this.currentNationality = event.target.value;
      this.filterAndRender();
    });

    // Troca de layout (grid/detalhes)
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

    // Navegação por scroll na visualização detalhada (desktop)
    window.addEventListener(
      "wheel",
      (event) => {
        if (
          this.currentLayout !== "detailed" ||
          this.isScrolling ||
          window.innerWidth <= 768 // Ignora o evento em telas mobile
        ) {
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

    // Navegação por botões na visualização detalhada
    this.prevBtn.addEventListener("click", () => this.navigateDetailedView(-1));
    this.nextBtn.addEventListener("click", () => this.navigateDetailedView(1));
  }

  /** Alterna a visibilidade entre o layout de grade e o de detalhes. */
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

  /** Aplica todos os filtros atuais (categoria, nacionalidade, busca) e re-renderiza a lista. */
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

  /** Navega para o card anterior ou próximo na visualização detalhada. */
  navigateDetailedView(direction) {
    const newIndex = this.detailedViewIndex + direction;
    if (newIndex < 0 || newIndex >= this.filteredCards.length) {
      this.isScrolling = false; // Libera o scroll se chegar no limite
      return; // Não faz nada se estiver no início ou no fim
    }
    this.detailedViewIndex = newIndex;
    this.renderDetailedView();
    this.updateNavButtons();
  }

  /** Cria o elemento HTML para a visualização detalhada. */
  createDetailedViewElement(card) {
    const detailedView = document.createElement("div");
    detailedView.className = "detailed-view";
    detailedView.innerHTML = this.getDetailedViewHTML(card);
    return detailedView;
  }

  /** Atualiza o estado (habilitado/desabilitado) dos botões de navegação detalhada. */
  updateNavButtons() {
    this.prevBtn.disabled = this.detailedViewIndex === 0;
    this.nextBtn.disabled =
      this.detailedViewIndex === this.filteredCards.length - 1;
  }

  onLanguageChange(newLang) {
    const oldLang = this.currentLang;
    const oldSelectedNationality = this.currentNationality;

    this.currentLang = newLang;
    this.createCardInstances();
    this.populateNationalityFilter();

    // Se uma nacionalidade estava selecionada, encontra a nova tradução e atualiza o estado.
    if (oldSelectedNationality !== "all") {
      // Encontra um card que tinha a nacionalidade antiga para usar como referência
      const referenceCardData = this.allData.find(
        (data) => data[oldLang]?.nationality === oldSelectedNationality
      );

      if (referenceCardData) {
        const newNationality = referenceCardData[newLang]?.nationality;
        this.currentNationality = newNationality; // Atualiza o estado do filtro
        this.nationalityFilter.value = newNationality; // Atualiza o valor do <select>
      } else {
        // Se não encontrar, reseta o filtro para evitar uma lista vazia
        this.currentNationality = "all";
        this.nationalityFilter.value = "all";
      }
    }

    this.filterAndRender();
  }

  /**
   * Gera o HTML interno para a visualização detalhada de um card.
   */
  getDetailedViewHTML(card) {
    const translations = this.languageSwitcher.translations[this.currentLang];
    const imageHtml = card.image
      ? `<div class="card-image-container"><img src="${card.image}" alt="${card.alt}" loading="lazy"></div>`
      : "";
    return `
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
            <div class="stat"><span class="stat-value">${
              card.wins
            }</span><span class="stat-label">${
      translations.stat_wins
    }</span></div>
            <div class="stat"><span class="stat-value">${
              card.podiums
            }</span><span class="stat-label">${
      translations.stat_podiums
    }</span></div>
            <div class="stat"><span class="stat-value">${
              card.poles
            }</span><span class="stat-label">${
      translations.stat_poles
    }</span></div>
          </div>
          <p>${card.description}</p>
        </div>
      </div>
    `;
  }
}

// --- Ponto de Entrada da Aplicação ---
// Aguarda o carregamento completo do DOM para iniciar a aplicação.
document.addEventListener("DOMContentLoaded", async () => {
  const app = new App(".card-container");
  await app.loadData("data.json");
  app.addEventListeners();
  app.filterAndRender();
});

// Garante compatibilidade com o Back/Forward Cache (bfcache) dos navegadores.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    console.log("Página restaurada do bfcache.");
  }
});
