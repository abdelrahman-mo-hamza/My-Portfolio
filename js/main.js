const countDownDate = new Date("Dec 31, 2027 23:59:59").getTime(),
  counter = setInterval(() => {
    var t = new Date().getTime(),
      t = countDownDate - t;
    const e = Math.floor(t / 864e5),
      o = Math.floor((t % 864e5) / 36e5),
      n = Math.floor((t % 36e5) / 6e4),
      r = Math.floor((t % 6e4) / 1e3);
    (document.querySelector(".days").textContent = e
      .toString()
      .padStart(2, "0")),
      (document.querySelector(".hours").textContent = o
        .toString()
        .padStart(2, "0")),
      (document.querySelector(".minutes").textContent = n
        .toString()
        .padStart(2, "0")),
      (document.querySelector(".seconds").textContent = r
        .toString()
        .padStart(2, "0")),
      t < 0 && clearInterval(counter);
  }, 1e3),
  progressSpans = document.querySelectorAll(".the-progress span"),
  section = document.querySelector(".our-skills"),
  nums = document.querySelectorAll(".stats .number"),
  statsSection = document.querySelector(".stats");
let started = !1;
function animateProgressWidth() {
  progressSpans.forEach((t) => {
    t.style.width = t.dataset.width;
  });
}
function increaseNumbers() {
  nums.forEach((t) => startCount(t));
}
function startCount(t) {
  const e = parseInt(t.dataset.goal);
  let o = parseInt(t.textContent);
  var n = Math.ceil((e - o) / 100);
  const r = setInterval(() => {
    (o += n),
      o >= e
        ? ((t.textContent = e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")),
          clearInterval(r))
        : (t.textContent = o.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  }, 50);
}
window.addEventListener("scroll", () => {
  window.scrollY >= section.offsetTop - 250 && animateProgressWidth(),
    window.scrollY >= statsSection.offsetTop &&
      !started &&
      (increaseNumbers(), (started = !0));
}),
  $(document).ready(() => {
    $("a").on("click", function (t) {
      var e;
      "" !== this.hash &&
        (t.preventDefault(),
        (e = this.hash),
        $("html, body").animate(
          { scrollTop: $(e).offset().top },
          800,
          function () {
            window.location.hash = e;
          }
        ));
    });
  });

