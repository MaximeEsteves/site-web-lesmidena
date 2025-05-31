
export function updateFavorisCount() {
  const favoris = JSON.parse(localStorage.getItem('favoris')) || [];
  const panier = JSON.parse(localStorage.getItem('panier')) || [];
  const compteur = document.getElementById('favoris-count');
  const compteurPanier = document.getElementById('panier-count');
  if (compteur) {
    compteur.textContent = favoris.length;
    compteur.style.display = favoris.length > 0 ? "inline-block" : "none";
  }
  if (panier) {
    compteurPanier.textContent = panier.length;
    compteurPanier.style.display = panier.length > 0 ? "inline-block" : "none";
  }
}

export async function initPageListeFavoris(produits) {
  const buttons = document.querySelectorAll('.btn-fav-article[data-id]');
  
  let favoris = JSON.parse(localStorage.getItem('favoris')) || [];
  buttons.forEach(btn => {
      const id = btn.dataset.id;
      const icon = btn.querySelector('i');
      const estFavori = favoris.some(f => f._id === id);
      if (estFavori) icon.classList.replace('fa-regular', 'fa-solid');
      
      btn.addEventListener('click', () => {
        
      favoris = JSON.parse(localStorage.getItem('favoris')) || [];
      const index = favoris.findIndex(f => f._id === id);

      if (index === -1) {
        const produit = produits.find(p => p._id === id);
        if (produit) {
          favoris.push(produit);
          icon.classList.replace('fa-regular', 'fa-solid');
        }
      } else {
        favoris.splice(index, 1);
        icon.classList.replace('fa-solid', 'fa-regular');
      }

      localStorage.setItem('favoris', JSON.stringify(favoris));
      updateFavorisCount();
    });
  });
}
export async function initPageListePanier(produits) {
  let panier = JSON.parse(localStorage.getItem('panier')) || [];
  
  // Gestion des boutons "btn-acheter"
  const btnAcheter = document.querySelectorAll('.btn-acheter[data-id]');
  
  btnAcheter.forEach(btn => {
    const id = btn.dataset.id;
    
    btn.addEventListener('click', () => {
      panier = JSON.parse(localStorage.getItem('panier')) || [];
      const index = panier.findIndex(f => f._id === id);
      
      if (index === -1) {
        // Produit non présent dans le panier : on l'ajoute avec les paramètres de btn-acheter
        const produit = produits.find(p => p._id === id);
        if (produit) {
          panier.push(produit);
          btn.textContent = 'Retirer du panier';
          btn.style.backgroundColor = 'transparent';
          btn.style.color = '#3a5151';
          btn.style.borderColor = '#3a5151';
        }
      } else {
        // Produit déjà présent : on le retire
        panier.splice(index, 1);
        btn.textContent = 'Acheter';
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }
      
      localStorage.setItem('panier', JSON.stringify(panier));
      updateFavorisCount();
    });
  });
  
  // Gestion des boutons "btn-ajouter-panier"
  const btnAjouterPanier = document.querySelectorAll('.btn-ajout-panier[data-id]');
  
  btnAjouterPanier.forEach(btn => {
    const id = btn.dataset.id;
    
    btn.addEventListener('click', () => {
      panier = JSON.parse(localStorage.getItem('panier')) || [];
      const index = panier.findIndex(f => f._id === id);
      
      if (index === -1) {
        // Produit non présent dans le panier : on l'ajoute avec les paramètres de btn-ajouter-panier
        const produit = produits.find(p => p._id === id);
        if (produit) {
          panier.push(produit);
          btn.textContent = 'Retirer du panier';
          btn.style.backgroundColor = 'transparent';
          btn.style.color = '#3a5151';
          btn.style.borderColor = '#3a5151';
        }
      } else {
        // Produit déjà présent : on le retire
        panier.splice(index, 1);
        btn.textContent = 'Ajouter au panier';
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }
      
      localStorage.setItem('panier', JSON.stringify(panier));
      updateFavorisCount();
    });
  });

  // Gestion des boutons "btn-ajouter-panier-favoris"  page favoris.html
  const btnAjouterPanierFavoris = document.querySelectorAll('.btn-ajout-panier-favoris[data-id]');
  
  btnAjouterPanierFavoris.forEach(btn => {
    const id = btn.dataset.id;
    
    btn.addEventListener('click', () => {
      panier = JSON.parse(localStorage.getItem('panier')) || [];
      const index = panier.findIndex(f => f._id === id);
      
      if (index === -1) {
        // Produit non présent dans le panier : on l'ajoute avec les paramètres de btn-ajouter-panier
        const produit = produits.find(p => p._id === id);
        if (produit) {
          panier.push(produit);
          btn.textContent = 'Retirer du panier';
          btn.style.backgroundColor = 'green';
        }
      } else {
        // Produit déjà présent : on le retire
        panier.splice(index, 1);
        btn.textContent = 'Ajouter au panier';
        btn.style.backgroundColor = '';
      }
      
      localStorage.setItem('panier', JSON.stringify(panier));
      updateFavorisCount();
    });
  });
}

// Met à jour les boutons en fonction de l'état du panier
export function mettreAJourBoutonsPanier() {
  const panier = JSON.parse(localStorage.getItem('panier')) || [];

  const boutons = document.querySelectorAll('.btn-ajout-panier[data-id]');

  boutons.forEach(btn => {
    const id = btn.dataset.id;
    const estDansPanier = panier.some(p => p._id === id);

    if (estDansPanier) {
      btn.textContent = 'Retirer du panier';
      btn.style.backgroundColor = 'transparent';
      btn.style.color = '#3a5151';
      btn.style.borderColor = '#3a5151';
    } else {
      btn.textContent = 'Ajouter au panier';
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });
  const boutonsAcheter = document.querySelectorAll('.btn-acheter[data-id]');

  boutonsAcheter.forEach(btn => {
    const id = btn.dataset.id;
    const estDansPanier = panier.some(p => p._id === id);

    if (estDansPanier) {
      btn.textContent = 'Retirer du panier';
      btn.style.backgroundColor = 'transparent';
      btn.style.color = '#3a5151';
      btn.style.borderColor = '#3a5151';
    } else {
      btn.textContent = 'Acheter';
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });

  const boutonsPanier = document.querySelectorAll('.btn-ajout-panier-favoris[data-id]');

  boutonsPanier.forEach(btn => {
    const id = btn.dataset.id;
    const estDansPanier = panier.some(p => p._id === id);

    if (estDansPanier) {
      btn.textContent = 'Retirer du panier';
      btn.style.backgroundColor = 'green';
    } else {
      btn.textContent = 'Ajouter au panier';
      btn.style.backgroundColor = '';
    }
  });
}
