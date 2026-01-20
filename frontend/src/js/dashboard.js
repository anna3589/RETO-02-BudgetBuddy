// Referencias
const deleteBtn = document.getElementById("delete-btn"); // ID corregido
const deleteIndicator = document.getElementById("delete-indicator");
const tagsContainer = document.getElementById("tags-container");
const dialog = document.getElementById("tag-dialog");
const btnSave = document.getElementById("btn-save-tag");
const inputName = document.getElementById("tag-name");
const inputColor = document.getElementById("tag-color");

// Datos Iniciales
let tags = [
    { nombre: "Gimnasio", color: "#3b82f6" },
    { nombre: "Internet", color: "#22c55e" },
    { nombre: "Gas", color: "#f97316" },
    { nombre: "Supermercado", color: "#ef4444" }
];

function loadTags() {
    tagsContainer.innerHTML = "";
    
    // Botón +
    const addBtn = document.createElement("button");
    addBtn.className = "add-tag-btn";
    addBtn.innerText = "+";
    addBtn.onclick = () => dialog.showModal();
    tagsContainer.appendChild(addBtn);

    tags.forEach((tagObj, index) => {
        const tagElement = document.createElement("div");
        tagElement.classList.add("payment-tag");
        tagElement.setAttribute("draggable", "true");
        const uniqueId = `tag-${index}`;
        tagElement.id = uniqueId;

        // Renderizado visual
        tagElement.innerHTML = `
            <span class="dot-indicator" style="background-color: ${tagObj.color};"></span> 
            ${tagObj.nombre} 
            <span class="amount">-${Math.floor(Math.random() * 50) + 10}€</span>
        `;
        
        // Eventos Drag
        tagElement.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", uniqueId);
            setTimeout(() => tagElement.style.opacity = "0.5", 0);
        });
        tagElement.addEventListener("dragend", () => tagElement.style.opacity = "1");

        tagsContainer.appendChild(tagElement);
    });
}

// Guardar Tag
btnSave.addEventListener("click", () => {
    if(!inputName.value) return;
    
    tags.push({
        nombre: inputName.value,
        color: inputColor.value
    });
    
    loadTags();
    inputName.value = "";
    dialog.close();
});

// Eventos Papelera
deleteBtn.addEventListener("dragover", (e) => {
    e.preventDefault();
    deleteBtn.style.transform = "scale(1.1)";
});

deleteBtn.addEventListener("dragleave", () => deleteBtn.style.transform = "scale(1)");

deleteBtn.addEventListener("drop", (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const el = document.getElementById(id);
    if(el) {
        el.remove();
        deleteIndicator.innerText = "¡Eliminado!";
        setTimeout(() => deleteIndicator.innerText = "", 2000);
    }
    deleteBtn.style.transform = "scale(1)";
});

// Arrancar
loadTags();