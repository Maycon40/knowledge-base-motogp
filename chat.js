export class Chatbot {
  constructor(championData) {
    // Elementos do DOM
    this.chatFab = document.getElementById("chat-fab");
    this.chatPopup = document.getElementById("chat-popup");
    this.closeChatBtn = document.getElementById("close-chat-btn");
    this.chatForm = document.getElementById("chat-form");
    this.chatInput = document.getElementById("chat-input");
    this.chatMessages = document.getElementById("chat-messages");

    try {
      // Dados e Estado
      this.championData = JSON.stringify(championData, null, 2);
      this.initializeChat();
      this.addEventListeners();
    } catch (error) {
      console.error("Erro ao inicializar o chatbot:", error);
      this.chatFab.style.display = "none";
    }
  }

  initializeChat() {
    this.addMessage(
      "Olá! Eu sou seu assistente de MotoGP. Pergunte-me sobre os campeões mundiais de 2015 a 2025.",
      "model"
    );
  }

  addEventListeners() {
    this.chatFab.addEventListener("click", () => this.togglePopup());
    this.closeChatBtn.addEventListener("click", () => this.togglePopup());
    this.chatForm.addEventListener("submit", (e) => this.handleSendMessage(e));
  }

  togglePopup() {
    this.chatPopup.classList.toggle("hidden");
  }

  async handleSendMessage(event) {
    event.preventDefault();
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.addMessage(message, "user");
    this.chatInput.value = "";

    // Adiciona o indicador de "digitando"
    const loadingElement = this.addMessage(
      "<span></span><span></span><span></span>",
      "model loading"
    );

    try {
      const response = await fetch(
        "https://backend-chat-gemini.vercel.app/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            champion_data: this.championData,
            message,
          }),
        }
      );
      const data = await response.json();
      text =
        data?.response ||
        "Desculpe, ocorreu um erro ao processar sua pergunta.";

      // Remove o indicador de "digitando" e atualiza com a resposta real
      loadingElement.classList.remove("loading");
      loadingElement.innerHTML = text;
    } catch (error) {
      console.error("Erro ao enviar mensagem para o Gemini:", error);
      loadingElement.classList.remove("loading");
      loadingElement.innerHTML =
        "Desculpe, ocorreu um erro ao processar sua pergunta.";
    }
  }

  addMessage(text, sender) {
    const messageElement = document.createElement("div");
    // Adiciona a classe base e depois as classes do 'sender'.
    // O '...' (spread operator) transforma a string "model loading" em "model", "loading"
    // que é o formato que o classList.add espera.
    messageElement.classList.add("chat-message", ...sender.split(" "));
    messageElement.innerHTML = text; // Usamos innerHTML para o efeito de loading
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight; // Auto-scroll
    return messageElement;
  }
}
