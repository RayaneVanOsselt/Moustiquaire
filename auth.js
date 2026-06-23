// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "aeris-moustiquaires.firebaseapp.com",
  projectId: "aeris-moustiquaires",
  storageBucket: "aeris-moustiquaires.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnopqrst"
};

// Auth Manager
const Auth = {
  user: null,
  initialized: false,

  init() {
    // Vérifier si l'utilisateur est déjà connecté (localStorage)
    const savedUser = localStorage.getItem('aeris_user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.updateUI();
    }
    this.initialized = true;
  },

  register(email, password, nom, prenom) {
    return new Promise((resolve, reject) => {
      // Simuler inscription (en production: utiliser Firebase Auth)
      const uid = 'user_' + Date.now();
      const user = {
        uid,
        email,
        nom,
        prenom,
        createdAt: new Date().toISOString(),
        addresses: [],
        orders: []
      };

      // Sauvegarder dans localStorage et simulated DB
      localStorage.setItem('aeris_user', JSON.stringify(user));
      localStorage.setItem('aeris_user_' + uid, JSON.stringify({
        ...user,
        password: btoa(password) // Simple encoding (en prod: hash côté serveur)
      }));

      this.user = user;
      this.updateUI();
      resolve(user);
    });
  },

  login(email, password) {
    return new Promise((resolve, reject) => {
      // Chercher l'utilisateur
      for (let key in localStorage) {
        if (key.startsWith('aeris_user_')) {
          const userData = JSON.parse(localStorage.getItem(key));
          if (userData.email === email && btoa(password) === userData.password) {
            const user = { ...userData };
            delete user.password;
            localStorage.setItem('aeris_user', JSON.stringify(user));
            this.user = user;
            this.updateUI();
            resolve(user);
            return;
          }
        }
      }
      reject(new Error('Email ou mot de passe incorrect'));
    });
  },

  logout() {
    localStorage.removeItem('aeris_user');
    this.user = null;
    this.updateUI();
    location.href = 'index.html';
  },

  isLoggedIn() {
    return !!this.user;
  },

  getUser() {
    return this.user;
  },

  updateProfile(data) {
    if (!this.user) return;
    this.user = { ...this.user, ...data };
    localStorage.setItem('aeris_user', JSON.stringify(this.user));
    const userKey = 'aeris_user_' + this.user.uid;
    const full = JSON.parse(localStorage.getItem(userKey));
    localStorage.setItem(userKey, JSON.stringify({ ...full, ...data }));
    this.updateUI();
  },

  addAddress(address) {
    if (!this.user) return;
    const newAddr = { ...address, id: 'addr_' + Date.now() };
    this.user.addresses = this.user.addresses || [];
    this.user.addresses.push(newAddr);
    this.updateProfile({ addresses: this.user.addresses });
    return newAddr;
  },

  saveOrder(order) {
    if (!this.user) return;
    const newOrder = { ...order, id: 'order_' + Date.now(), date: new Date().toISOString(), status: 'Confirmée' };
    this.user.orders = this.user.orders || [];
    this.user.orders.push(newOrder);
    this.updateProfile({ orders: this.user.orders });
    return newOrder;
  },

  updateUI() {
    const navCta = document.querySelector('.nav-cta');
    if (!navCta) return;

    if (this.user) {
      // Utilisateur connecté
      const userBtn = navCta.querySelector('.user-profile');
      if (userBtn) userBtn.remove();

      const html = `
        <div class="user-profile">
          <button class="user-btn" id="user-menu-btn">👤 ${this.user.prenom}</button>
          <div class="user-menu" id="user-menu" style="display:none">
            <a href="profile.html">Mon Profil</a>
            <a href="orders.html">Mes Commandes</a>
            <a href="account.html">Mon Compte</a>
            <button id="logout-btn" style="width:100%;text-align:left;padding:10px;border:none;background:none;cursor:pointer;color:#d97770">Déconnexion</button>
          </div>
        </div>
      `;

      const userDiv = document.createElement('div');
      userDiv.className = 'user-profile';
      userDiv.innerHTML = html;
      navCta.insertBefore(userDiv, navCta.firstChild);

      // Events
      const userBtn = document.getElementById('user-menu-btn');
      const userMenu = document.getElementById('user-menu');
      const logoutBtn = document.getElementById('logout-btn');

      userBtn.addEventListener('click', () => {
        userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
      });

      logoutBtn.addEventListener('click', () => this.logout());

      // Fermer menu si click ailleurs
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile')) {
          userMenu.style.display = 'none';
        }
      });
    } else {
      // Utilisateur pas connecté
      const userBtn = navCta.querySelector('.user-profile');
      if (userBtn) userBtn.remove();

      const html = `
        <a href="login.html" class="btn btn-outline btn-sm">Connexion</a>
      `;
      const loginBtn = document.createElement('div');
      loginBtn.innerHTML = html;
      navCta.insertBefore(loginBtn.firstChild, navCta.firstChild);
    }
  }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => Auth.init());
