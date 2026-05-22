// On récupère les éléments HTML grâce à leur id
const champPrixHT = document.getElementById("prixHT");
const champTauxTVA = document.getElementById("tauxTVA");
const zoneTauxPersonnalise = document.getElementById("zoneTauxPersonnalise");
const champTauxPersonnalise = document.getElementById("tauxPersonnalise");

const boutonCalculer = document.getElementById("boutonCalculer");
const boutonReset = document.getElementById("boutonReset");
const boutonRecharger = document.getElementById("boutonRecharger");

const zoneResultat = document.getElementById("resultat");
const creditsRestants = document.getElementById("creditsRestants");

// On récupère les crédits stockés dans le navigateur
let credits = localStorage.getItem("creditsTVA");

// Si aucun crédit n'existe encore, on offre 50 crédits
if (credits === null) {
  credits = 50;
  localStorage.setItem("creditsTVA", credits);
} else {
  credits = Number(credits);
}

// On affiche les crédits au chargement de la page
creditsRestants.textContent = "Crédits restants : " + credits;

// Quand l'utilisateur choisit un taux, on vérifie s'il a choisi "Personnalisé"
champTauxTVA.addEventListener("change", function () {
  if (champTauxTVA.value === "personnalise") {
    zoneTauxPersonnalise.classList.remove("hidden");
  } else {
    zoneTauxPersonnalise.classList.add("hidden");
  }
});

// Quand l'utilisateur clique sur le bouton Calculer
boutonCalculer.addEventListener("click", function () {
  // On vérifie d'abord s'il reste des crédits
  if (credits <= 0) {
    zoneResultat.textContent = "Vous n'avez plus de crédits. Veuillez recharger pour continuer.";
    return;
  }

  // On récupère le prix HT
  const prixHT = Number(champPrixHT.value);

  // On vérifie si le prix est valide
  if (prixHT <= 0) {
    zoneResultat.textContent = "Veuillez entrer un prix HT valide.";
    return;
  }

  let tauxTVA;

  // Si l'utilisateur choisit un taux personnalisé
  if (champTauxTVA.value === "personnalise") {
    tauxTVA = Number(champTauxPersonnalise.value);

    if (tauxTVA <= 0) {
      zoneResultat.textContent = "Veuillez entrer un taux de TVA valide.";
      return;
    }
  } else {
    tauxTVA = Number(champTauxTVA.value);
  }

  // On calcule le montant de la TVA
  const montantTVA = prixHT * tauxTVA / 100;

  // On calcule le prix TTC
  const prixTTC = prixHT + montantTVA;

  // On retire 1 crédit après un calcul valide
  credits = credits - 1;
  localStorage.setItem("creditsTVA", credits);
  creditsRestants.textContent = "Crédits restants : " + credits;

  // On affiche le résultat
  zoneResultat.innerHTML =
    "Montant TVA : " + montantTVA.toFixed(2) + " €<br>" +
    "Prix TTC : " + prixTTC.toFixed(2) + " €";
});

// Quand l'utilisateur clique sur Réinitialiser
boutonReset.addEventListener("click", function () {
  champPrixHT.value = "";
  champTauxTVA.value = "20";
  champTauxPersonnalise.value = "";
  zoneTauxPersonnalise.classList.add("hidden");
  zoneResultat.textContent = "Résultat : en attente...";
});

// Quand l'utilisateur clique sur Recharger avec Stripe
boutonRecharger.addEventListener("click", async function () {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      zoneResultat.textContent = "Erreur lors de la création du paiement.";
    }
  } catch (error) {
    zoneResultat.textContent = "Impossible de contacter Stripe.";
  }
});

// On vérifie si l'utilisateur revient après un paiement Stripe
const params = new URLSearchParams(window.location.search);

if (params.get("success") === "true") {
  credits = credits + 50;
  localStorage.setItem("creditsTVA", credits);
  creditsRestants.textContent = "Crédits restants : " + credits;
  zoneResultat.textContent = "Paiement réussi : 50 crédits ajoutés.";
}

if (params.get("canceled") === "true") {
  zoneResultat.textContent = "Paiement annulé.";
}