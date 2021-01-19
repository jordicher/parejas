const db = firebase.firestore();

const imprimir = document.getElementById("imprimir");
const startGame = document.getElementById("startGame");
const timeStart = document.getElementById("timeStart");
const impIncorrectas = document.getElementById("impIncorrectas");
const impCorrectas = document.getElementById("impCorrectas");
const popStart = document.getElementById("popStart");
const topUsers = document.getElementById("topUsers");

const fragment = document.createDocumentFragment();
/* enviar y recoger datos firebase */
const formTop = document.getElementById("formTop");

var idInterval;
var time = 0;
var eleccion = "";
var correctas = 0;
var incorrectas = 0;
const arrayImagenes = [];

window.addEventListener("load", () => {
  startGame.textContent = "Start";

  startGame.addEventListener("click", () => {
    if (formTop["nameUsuario"].value !== "") {
      popStart.style.display = "none";
      restart();
    } else {
      formTop["nameUsuario"].placeholder = "Pon tu nombre";
      formTop["nameUsuario"].classList.add("border-red-400");
    }
  });
});

/* pedimos 10 imagenes random, y las multiplicamos por dos, a partir de si tienen la misma name sabemos si sera pareja o no */
for (let i = 0; i < 10; i++) {
  for (let x = 0; x < 2; x++) {
    let div = document.createElement("div");
    div.className = "fondoCarta m-3 rounded";
    let img = document.createElement("img");
    img.src = `https://picsum.photos/200/300?random=${i}`;
    img.className = "opacity-0";
    img.name = i + 1;
    div.appendChild(img);
    arrayImagenes.push(div);
  }
}

const randomNum = (max) => {
  return Math.floor(Math.random() * max);
};

const remover = () => {
  const arrayRemover = [];

  arrayImagenes.map((img) =>
    arrayRemover.splice(randomNum(arrayRemover.length), 0, img)
  );

  return arrayRemover;
};

const impImagenes = (imagenes) => {
  imagenes.forEach((e) => {
    fragment.appendChild(e);
  });
  imprimir.appendChild(fragment);
};

impImagenes(arrayImagenes);

for (const imagen of arrayImagenes) {
  imagen.addEventListener("click", (e) => {
    if (e.target.classList.contains("opacity-100")) return;
    //precaución para evitar que el usuario regire las parejas, correctas. O haga doble click en la misma

    girarImagen(e.target);
    /* AQUI potser podem fer més facil els condicionals */
    if (eleccion === "") {
      eleccion = e.target;
    } else if (eleccion !== e.target) {
      if (eleccion.name == e.target.name) {
        correctas++;
        eleccion = "";
        impCorrectas.textContent = correctas;

        if (correctas == 10) {
          imprimir.classList.add("animate-pulse");
          stopInterval();
          enviarForm();
          popStart.style.display = "block";
        }
      } else {
        mantenerImagen(e);
        incorrectas++;
        impIncorrectas.textContent = incorrectas;
      }
    }
  });
}

const girarImagen = (imagen) => {
  imagen.classList.add("flip-vertical-right", "opacity-100");
};

const mantenerImagen = (e) => {
  setTimeout(() => {
    eleccion.classList = "opacity-0";
    e.target.classList = "opacity-0";
    eleccion = "";
  }, 500);
};

const restart = () => {
  for (const divImagen of arrayImagenes) {
    stopInterval();
    divImagen.firstChild.className = "opacity-0";
    imprimir.className =
      "container mx-auto grid grid-rows-5 md:grid-rows-3 grid-flow-col gap-1 md:gap-3";
    time = 0;
    correctas = 0;
    incorrectas = 0;
    impIncorrectas.textContent = incorrectas;
    impCorrectas.textContent = correctas;

    impImagenes(remover());
    iniciarTemporizador();
  }
};

const iniciarTemporizador = () => {
  idInterval = setInterval(() => {
    time++;
    timeStart.textContent = `${time}s`;
  }, 1000);
};

function stopInterval() {
  clearInterval(idInterval);
}

const enviarForm = async () => {
  await db.collection("usuarios").doc().set({
    name: formTop["nameUsuario"].value,
    errors: incorrectas,
    time: time,
  });
  getUsers();
};

const getUsers = async () => {
  topUsers.innerHTML = "";
  const querySnapshot = await db
    .collection("usuarios")
    .orderBy("time", "asc")
    .limit(10)
    .get();
  querySnapshot.forEach((doc) => {
    let div = document.createElement("div");
    div.className = "grid grid-cols-3";
    div.innerHTML = `<span>${doc.data().name} </span> <span> ${
      doc.data().time
    }s </span>  <span class="text-red-400"> ${doc.data().errors} </span>`;
    topUsers.appendChild(div);
  });
};

getUsers();
