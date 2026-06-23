/* ===========================================================
   AÉRIS — JS partagé
   =========================================================== */

/* ---------- Photos réelles + repli élégant ----------
   Chaque <img data-kw="..."> charge une vraie photo choisie à la main
   montrant de vraies moustiquaires (toile/grillage posé sur fenêtre ou
   porte) plutôt que des fenêtres/portes nues, afin que les visuels
   correspondent réellement aux produits vendus. En cas d'échec
   (hors-ligne), le conteneur .ph bascule sur un dégradé de marque. */
const PHOTO_MAP = {
  // moustiquaires de fenêtre (vue rapprochée, toile + cadre visibles)
  'window,sunlight,interior,plants': 'https://images.unsplash.com/photo-1693874828904-c3d3573de238',
  'modern,living,room,window':       'https://images.unsplash.com/photo-1758998222336-d48b2390a686',
  'window,frame,house':              'https://images.unsplash.com/photo-1758998222336-d48b2390a686',
  'window,glass,modern':             'https://images.unsplash.com/photo-1693874828904-c3d3573de238',
  'large,window,villa':              'https://images.unsplash.com/photo-1758998222336-d48b2390a686',
  // moustiquaires de porte (toile moustiquaire visible sur la porte)
  'patio,door,glass':                'https://images.unsplash.com/photo-1779430907308-07b21c3f0f58',
  'sliding,door,terrace':            'https://images.unsplash.com/photo-1779430907308-07b21c3f0f58',
  'door,house,entrance':             'https://images.unsplash.com/photo-1779430907308-07b21c3f0f58',
  'door,wood,house':                 'https://images.unsplash.com/photo-1779430907308-07b21c3f0f58',
  'curtain,door,home':               'https://images.unsplash.com/photo-1779430907308-07b21c3f0f58',
  'craftsman,workshop,aluminium,frame': 'https://images.unsplash.com/photo-1685320198649-781e83a61de4',
  'aluminium,workshop,manufacturing':   'https://images.unsplash.com/photo-1685320198649-781e83a61de4',
  'portrait,woman':              'https://randomuser.me/api/portraits/women/65.jpg',
  'portrait,man':                'https://randomuser.me/api/portraits/men/32.jpg',
  'portrait,woman,smile':        'https://randomuser.me/api/portraits/women/44.jpg',
  'portrait,man,professional':   'https://randomuser.me/api/portraits/men/75.jpg',
  'portrait,woman,professional': 'https://randomuser.me/api/portraits/women/23.jpg',
  'portrait,man,smile':          'https://randomuser.me/api/portraits/men/51.jpg',
};

function photoSrc(kw, w, h){
  const base = PHOTO_MAP[kw];
  if (!base) return null;
  if (base.includes('images.unsplash.com')) return `${base}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
  return base; // randomuser.me : taille fixe, pas de redimensionnement
}

function mountPhotos(){
  document.querySelectorAll('img[data-kw]').forEach(img=>{
    const w = img.dataset.w || 1200, h = img.dataset.h || 900;
    const src = photoSrc(img.dataset.kw, w, h);

    if (!src) {
      const box = img.closest('.ph');
      img.remove();
      if (box) box.classList.add('is-fallback');
      return;
    }

    // Timeout pour afficher fallback si image prend trop longtemps
    const timeoutId = setTimeout(() => {
      if (!img.complete || img.naturalHeight === 0) {
        const box = img.closest('.ph');
        if (box && !box.classList.contains('is-fallback')) {
          box.classList.add('is-fallback');
        }
      }
    }, 6000);

    img.addEventListener('load', () => clearTimeout(timeoutId));
    img.addEventListener('error', () => {
      clearTimeout(timeoutId);
      const box = img.closest('.ph');
      img.remove();
      if(box) box.classList.add('is-fallback');
    }, {once:true});

    img.classList.add('ph-real');
    img.src = src;
    img.loading = img.dataset.eager ? 'eager' : 'lazy';
  });
}

/* ---------- Menu mobile ---------- */
function mountMenu(){
  const b = document.querySelector('.burger');
  const m = document.querySelector('.mobile-menu');
  if(!b||!m) return;
  b.addEventListener('click',()=>{
    m.classList.toggle('open');
    b.setAttribute('aria-expanded', m.classList.contains('open'));
  });
  m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>m.classList.remove('open')));
}

/* ---------- Reveal au défilement ---------- */
function mountReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io = new IntersectionObserver((ent)=>{
    ent.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.12});
  els.forEach(e=>io.observe(e));
}

/* ---------- Lien actif dans la nav ---------- */
function mountActiveLink(){
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === page) a.classList.add('active');
  });
}

/* ---------- Panier (stockage protégé) ---------- */
const Cart = {
  key:'aeris_cart',
  read(){ try{ return JSON.parse(localStorage.getItem(this.key))||[] }catch(e){ return this._mem||[] } },
  write(items){ this._mem=items; try{ localStorage.setItem(this.key, JSON.stringify(items)) }catch(e){} this.refresh(); },
  add(item){ const items=this.read(); items.push(item); this.write(items); },
  count(){ return this.read().reduce((n,i)=>n+(i.qty||1),0); },
  increment(idx){ const items=this.read(); if(items[idx]) items[idx].qty=(items[idx].qty||1)+1; this.write(items); },
  decrement(idx){ const items=this.read(); if(items[idx]&&items[idx].qty>1) items[idx].qty--; else items.splice(idx,1); this.write(items); },
  remove(idx){ const items=this.read(); items.splice(idx,1); this.write(items); },
  clear(){ this._mem=[]; try{ localStorage.removeItem(this.key) }catch(e){} this.refresh(); },
  refresh(){
    const c = document.querySelector('.cart-count');
    if(!c) return;
    const n = this.count();
    c.textContent = n;
    c.classList.toggle('show', n>0);
  }
};

/* ---------- Toast ---------- */
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.innerHTML = `<span class="d"></span>${msg}`;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ---------- Init global ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  mountPhotos();
  mountMenu();
  mountReveal();
  mountActiveLink();
  Cart.refresh();
  // boutons "ajouter au panier" déclaratifs
  document.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      Cart.add({name:btn.dataset.add, price:+btn.dataset.price||0, qty:1});
      toast(btn.dataset.add+' ajouté au panier');
    });
  });
});
