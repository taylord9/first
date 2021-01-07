let btn = document.querySelector(".btn");
let curs = document.querySelector(".cursor");
let close = document.querySelector(".close");
let menu = document.querySelector(".menu");
let active = document.querySelector(".active");

let menuEL = document.querySelectorAll(".menu a");

menuEL.forEach((element) => {
  element.addEventListener("mouseover", () => {
    active.innerHTML = element.innerHTML;
  });
});

btn.addEventListener("click", () => {
  btn.style.width = "100%";
  btn.style.height = "100%";
  btn.style.borderRadius = "0%";
  close.style.display = "block";
  menu.style.display = "block";
});

close.addEventListener("click", () => {
  btn.style.width = "100px";
  btn.style.height = "100px";
  btn.style.borderRadius = "0%";
  close.style.display = "none";
  menu.style.display = "none";

  setTimeout(() => {
    btn.style.borderRadius = "100%";
  }, 200);
});

document.addEventListener("mousemove", (e) => {
  let x = e.pageX;
  let y = e.pageY;
  curs.style.left = e.pageX - 15 + "px";
  curs.style.top = e.pageY - 15 + "px";
});
