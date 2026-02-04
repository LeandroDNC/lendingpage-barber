function copiarTexto() {
  var input = document.getElementById("meuInput");

  input.select();
  input.setSelectionRange(0, 99999);

  try {
    navigator.clipboard.writeText(input.value).then(() => {
      alert("Copiado: " + input.value);
    });
  } catch (err) {
    try {
      document.execCommand("copy");
      alert("Copiado: " + input.value);
    } catch (err2) {
      alert("Não foi possível copiar automaticamente 😢\nCopie manualmente.");
    }
  }
}


function abrirPopup() {
  document.querySelector(".popupoverley").style.display = "flex";
  document.body.classList.add("sem-scroll"); 
}

function fecharPopup() {
  document.querySelector(".popupoverley").style.display = "none";
  document.body.classList.remove("sem-scroll"); 
}

