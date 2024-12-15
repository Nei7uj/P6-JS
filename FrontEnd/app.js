async function getWorks(filter) {
    document.querySelector(".gallery").innerHTML = "";
    document.querySelector(".modal-gallery").innerHTML = "";
    const url = "http://localhost:5678/api/works";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      } 
      const json = await response.json();
      if (filter) {
        const filtered = json.filter((data) => data.categoryId === filter);
        for (let i = 0; i < filtered.length; i++) {
            setFigure(filtered[i]);
            setFigureModal(filtered[i]);
          }
      }
        else {
            for (let i = 0; i < json.length; i++) {
                setFigure(json[i]);
                setFigureModal(json[i]);
            }
        }
        //Delete
          const trashCans = document.querySelectorAll(".fa-trash-can");
          trashCans.forEach((e) => e.addEventListener("click", (event) => deleteWork(event))
        );
    } catch (error) {
      console.error(error.message);
    }
}
getWorks()

function setFigure(data) {
    const figure = document.createElement("figure");
    figure.setAttribute ("id", `figure-accueil-${data.id}`)
    figure.innerHTML = `<img src=${data.imageUrl} alt=${data.title}> 
                        <figcaption>${data.title}</figcaption>`;
    document.querySelector(".gallery").append(figure);
}


function setFigureModal(data) {
  const figure = document.createElement("figure");
  figure.setAttribute ("id", `figure-${data.id}`)
  figure.innerHTML = `<div class="image-container">
                      <img src="${data.imageUrl}" alt="${data.title}"> 
                      <figcaption>${data.title}</figcaption>
                      <i id=${data.id} class="fa-solid fa-trash-can overlay-icon"></i>
                      </div>`;                   
  document.querySelector(".modal-gallery").append(figure);
}

async function getCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
    
        const json = await response.json();
        for (let i = 0; i < json.length; i++) {
          setFilter(json[i]);
        }
      } catch (error) {
        console.error(error.message);
      }
}
getCategories();

function setFilter(data) {
    const div = document.createElement("div");
    div.className = data.id;
    div.addEventListener("click", () => getWorks(data.id));
    div.addEventListener("click", (event) => toggleFilter(event));
    document
    .querySelector(".tous")
    .addEventListener("click", (event) => toggleFilter(event));
    div.innerHTML = `${data.name}`;
    document.querySelector(".div-container").append(div);
}

function toggleFilter(event) {
    const container = document.querySelector(".div-container");
    Array.from(container.children).forEach((child) => 
    child.classList.remove("active-filter")
  );
    event.target.classList.add("active-filter");  
}
       
document.querySelector(".tous").addEventListener("click", () => getWorks());


function displayAdminMode() {
  if (sessionStorage.authToken) {
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML =
    '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i>Mode édition</a></p>';
    document.body.prepend(editBanner);
    document.querySelector(".log-button").textContent = "logout";
  }
}
displayAdminMode();

let modal = null;
const focusableSelector = "button, a, input, textarea"
let focusables = []

const openModal = function (e) {
  e.preventDefault()
  modal = document.querySelector (e.target.getAttribute('href'));
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  focusables[0].focus()
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  modal.querySelectorAll(".js-modal-close").forEach((e) => e.addEventListener("click", closeModal));
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
}

const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault()
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
  modal = null;
}

const stopPropagation = function (e) {
  e.stopPropagation();
}

const focusInModal = function (e) {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === modal.querySelector(":focus"));
  if (e.shiftKey === true) {
    index--;
  } else {
    index++;
  }
  if(index >= focusables.length) {
    index = 0;
  }
  if (index < 0) {
    index = focusables.length - 1;
  }
  focusables[index].focus();
}

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
  if (e.key === "Tab" && modal !== null) {
    focusInModal(e);
  }
})

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
})


async function deleteWork(event) {
  event.stopPropagation();
  const id = event.srcElement.id; 
  const deleteApi = "http://localhost:5678/api/works/";
  const token = sessionStorage.authToken;
  let response = await fetch(deleteApi + id, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
  }
});
if(response.status == 401 || response.status == 500) {
  const errorBox = document.createElement("div");
  errorBox.className = 'error-login';
  errorBox.innerHTML = "Il y a eu une erreur";
  document.querySelector(".modal-button-container").prepend(errorBox);
} else {
  let result =response;
  console.log(result);
  const deleteItem = document.getElementById (`figure-${id}`);
  deleteItem.remove();
  const deleteItemAccueil = document.getElementById (`figure-accueil-${id}`);
  deleteItemAccueil.remove();
}}

const addPhotoButton = document.querySelector('.add-photo-button');
addPhotoButton.addEventListener('click', toggleModal);
const backButton = document.querySelector('.js-modal-back');
backButton.addEventListener("click", toggleModal);

function toggleModal() {
  const galleryModal = document.querySelector(".gallery-modal");
  const addModal = document.querySelector(".add-modal");

  if (
    galleryModal.style.display === "block" || galleryModal.style.display === ""
  ) {
    galleryModal.style.display = "none";
    addModal.style.display = "block";
  } else {
    galleryModal.style.display = "block";
    addModal.style.display = "none";
  }
}

let img = document.createElement("img");
let file;

document.querySelector("#file").style.display = "none";
document.getElementById("file").addEventListener("change", function (event) {
  file = event.target.files[0];
  if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      img.alt= "Uploaded Photo";
      document.getElementById("photo-container").appendChild(img);
    }
    reader.readAsDataURL(file);
    document.querySelectorAll('.picture-loaded').forEach((e) => (e.style.display = "none"));
  } else {
    alert("Veuillez sélectionner une image au format JPG ou PNG.");
  }
})


const titleInput = document.getElementById("title");
let titleValue = "";
let selectedValue = "1";
document.getElementById("category").addEventListener("change", function () {
  selectedValue = this.value;
})
titleInput.addEventListener("input", function () {
  titleValue = titleInput.value;
})

const addPictureForm = document.getElementById("picture-form");
addPictureForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  // Vérifie si une image et un titre sont présents
  const hasImage = document.querySelector("#photo-container img");
  if (!hasImage || !titleValue) {
    console.error("Image ou titre manquant.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", titleValue);
  formData.append("category", selectedValue);

  const token = sessionStorage.authToken;
  if (!token) {
    console.error("Token d'authentification manquant.");
    return;
  }

  try {
    let response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur lors de la requête :", errorText);
      const errorBox = document.createElement("div");
      errorBox.className = 'error-login';
      errorBox.innerHTML = "Il y a eu une erreur lors de l'upload.";
      document.querySelector("form").prepend(errorBox);
    } else {
      // Ajout de l'élément à la galerie après un succès
      let result = await response.json();
      console.log("Upload réussi :", result);

      // Mise à jour immédiate de la galerie et de la modale
      setFigure(result); // Ajouter à la galerie principale
      setFigureModal(result); // Ajouter à la modale

      // Réinitialisation du formulaire après upload
      const photoContainer = document.getElementById("photo-container");
      const uploadedImage = photoContainer.querySelector("img");
      if (uploadedImage) {
        photoContainer.removeChild(uploadedImage); // Supprime uniquement l'image.
      }

document.querySelectorAll('.picture-loaded').forEach((e) => (e.style.display = "block")); // Réaffiche les éléments masqués.

      // Rafraîchit la galerie modale
      await getWorks(); // Recharger toutes les données pour la galerie principale et la modale
      closeModal(new Event('click')); // Simule un clic pour fermer la modale
      setTimeout(() => closeModal(new Event('click')), 500);

      // Basculer sur la modal galerie photo
      const galleryModal = document.querySelector(".gallery-modal");
      const addModal = document.querySelector(".add-modal");

      addModal.style.display = "none"; // Masque la modal d'ajout
      galleryModal.style.display = "block"; // Affiche la modal galerie
    }
  } catch (err) {
    console.error("Erreur lors de la requête :", err);
  }
});


