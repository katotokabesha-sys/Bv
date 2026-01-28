const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawerMenu");

menuBtn.onclick = () => {
drawer.classList.toggle("open");
};

function showSection(id) {
document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
document.getElementById(id).classList.remove("hidden");
drawer.classList.remove("open");
}
