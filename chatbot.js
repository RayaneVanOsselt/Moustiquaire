const Chatbot = {
  isOpen: false,
  messages: [],

  faq: [
    { q: ['bonjour', 'salut', 'hi', 'hello'], r: 'Bonjour ! 👋 Je suis l\'assistant AÉRIS. Comment puis-je t\'aider ?' },
    { q: ['prix', 'coût', 'tarif', 'combien'], r: 'Les prix dépendent de vos dimensions et options. Utilisez notre <a href="configurateur.html">configurateur</a> pour un devis en temps réel !' },
    { q: ['livraison', 'délai', 'quand'], r: 'Livraison estimée : 10-15 jours après confirmation de la commande. 🚚' },
    { q: ['commande', 'passer commande', 'commander'], r: 'Pour commander : 1) Configurez votre moustiquaire 2) Ajoutez au panier 3) <a href="commande.html">Passez la commande</a>' },
    { q: ['garantie', 'garant', 'protection'], r: 'Toutes nos moustiquaires bénéficient d\'une garantie 5 ans ! 🛡️' },
    { q: ['produit', 'fenêtre', 'porte', 'type'], r: 'Nous proposons : Fenêtres, Portes, Coulissantes, Plissées. Voir notre <a href="produits.html">catalogue</a>' },
    { q: ['installation', 'poser', 'monter'], r: 'Installation simple et rapide. Consultez notre section <a href="savoir-faire.html">savoir-faire</a> pour les détails.' },
    { q: ['contact', 'email', 'téléphone'], r: 'Contactez-nous : <a href="contact.html">formulaire de contact</a> · Téléphone : +32 2 000 00 00 · Email : contact@aeris.example' },
    { q: ['fabrication', 'où', 'europe'], r: 'Fabrication 100% européenne sur mesure. Qualité premium, pensée pour durer ! 🇪🇺' },
    { q: ['paiement', 'comment payer', 'sécurisé'], r: 'Paiement sécurisé SSL. Stripe, PayPal, Bancontact, Apple Pay, Google Pay acceptés.' },
    { q: ['retour', 'remboursement', 'insatisfait'], r: 'Consulte nos <a href="faq.html">FAQ</a> pour les conditions de retour et remboursement.' },
    { q: ['merci', 'thanks', 'au revoir', 'bye'], r: 'De rien ! À bientôt chez AÉRIS ! 😊' }
  ],

  init() {
    this.createWidget();
    this.attachEvents();
  },

  createWidget() {
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = `
      <div class="chatbot-bubble" id="chatbot-bubble">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.5.3 2.9.9 4.2L2 22l6-1.5c1.3.6 2.7.9 4.3.9 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
      </div>
      <div class="chatbot-window" id="chatbot-window" style="display:none">
        <div class="chatbot-header">
          <div class="chatbot-title">Assistant AÉRIS</div>
          <button class="chatbot-close" id="chatbot-close">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" placeholder="Posez votre question..." autocomplete="off">
          <button id="chatbot-send">→</button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
  },

  attachEvents() {
    const bubble = document.getElementById('chatbot-bubble');
    const window_ = document.getElementById('chatbot-window');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const send = document.getElementById('chatbot-send');

    bubble.addEventListener('click', () => this.toggle());
    close.addEventListener('click', () => this.toggle());
    send.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => e.key === 'Enter' && this.sendMessage());
  },

  toggle() {
    this.isOpen = !this.isOpen;
    const window_ = document.getElementById('chatbot-window');
    const bubble = document.getElementById('chatbot-bubble');

    window_.style.display = this.isOpen ? 'flex' : 'none';
    bubble.style.opacity = this.isOpen ? '0.5' : '1';

    if (this.isOpen && this.messages.length === 0) {
      this.addMessage('bot', 'Bonjour ! 👋 Je suis l\'assistant AÉRIS. Comment puis-je t\'aider ?');
    }
  },

  sendMessage() {
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();
    if (!text) return;

    this.addMessage('user', text);
    input.value = '';

    setTimeout(() => {
      const response = this.findResponse(text);
      this.addMessage('bot', response);
    }, 300);
  },

  findResponse(text) {
    const lower = text.toLowerCase();
    for (let item of this.faq) {
      for (let q of item.q) {
        if (lower.includes(q)) return item.r;
      }
    }
    return 'Je n\'ai pas compris. Pouvez-vous rephrase votre question ? 😊';
  },

  addMessage(sender, text) {
    this.messages.push({ sender, text });
    const messagesDiv = document.getElementById('chatbot-messages');
    const msgEl = document.createElement('div');
    msgEl.className = `chatbot-msg chatbot-msg-${sender}`;
    msgEl.innerHTML = text;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};

document.addEventListener('DOMContentLoaded', () => Chatbot.init());
