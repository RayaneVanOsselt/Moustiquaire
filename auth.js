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
      try {
        this.user = JSON.parse(savedUser);
      } catch (e) {
        this.user = null;
        localStorage.removeItem('aeris_user');
      }
    }
    // Toujours mettre à jour l'UI (connecté OU non connecté)
    this.updateUI();
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

    // Supprimer l'ancien élément auth (profil OU connexion) — conteneur unique
    const old = navCta.querySelector('.auth-nav-item');
    if (old) old.remove();

    if (this.user) {
      // Utilisateur connecté → menu profil
      const userDiv = document.createElement('div');
      userDiv.className = 'auth-nav-item user-profile';
      userDiv.innerHTML = `
        <button class="user-btn" type="button">👤 ${this.user.prenom}</button>
        <div class="user-menu" style="display:none;position:absolute;top:100%;right:0;background:#fff;border:1px solid var(--ligne);border-radius:12px;min-width:180px;box-shadow:0 4px 12px rgba(0,0,0,.15);z-index:1000;margin-top:8px;overflow:hidden">
          <a href="profile.html" style="display:block;padding:12px 16px;color:var(--gris);text-decoration:none;border-bottom:1px solid var(--ligne)">Mon Profil</a>
          <a href="orders.html" style="display:block;padding:12px 16px;color:var(--gris);text-decoration:none;border-bottom:1px solid var(--ligne)">Mes Commandes</a>
          <a href="account.html" style="display:block;padding:12px 16px;color:var(--gris);text-decoration:none;border-bottom:1px solid var(--ligne)">Mon Compte</a>
          <button type="button" class="logout-btn" style="width:100%;text-align:left;padding:12px 16px;border:none;background:none;cursor:pointer;color:#d97770;font-family:inherit;font-size:14px">Déconnexion</button>
        </div>
      `;

      navCta.insertBefore(userDiv, navCta.firstChild);

      // Attacher les événements directement (les éléments sont dans le DOM)
      const userBtn = userDiv.querySelector('.user-btn');
      const userMenu = userDiv.querySelector('.user-menu');
      const logoutBtn = userDiv.querySelector('.logout-btn');

      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
      });

      logoutBtn.addEventListener('click', () => this.logout());

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile')) {
          userMenu.style.display = 'none';
        }
      });
    } else {
      // Utilisateur non connecté → bouton Connexion
      const loginDiv = document.createElement('div');
      loginDiv.className = 'auth-nav-item';
      loginDiv.innerHTML = '<a href="login.html" class="btn btn-outline btn-sm">Connexion</a>';
      navCta.insertBefore(loginDiv, navCta.firstChild);
    }
  }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => Auth.init());
