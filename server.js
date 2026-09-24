// Step Academy — Node.js server (kutubxonasiz, toza Node.js)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "kurslar.json"), "utf8")
);

// HTML ichidagi xavfli belgilar uchun
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(boshSahifa, ichki) {
  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(boshSahifa)}</title>
  <meta name="description" content="${esc(DATA.sayt.tavsif)}">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <nav class="nav">
      <a class="logo" href="/">Step<span>Academy</span></a>
      <div class="nav-links">
        <a href="/">Bosh sahifa</a>
        ${DATA.kurslar.map((k) => `<a href="/kurs/${esc(k.slug)}">${esc(k.nom)}</a>`).join("\n        ")}
        <a href="/api/kurslar">API</a>
      </div>
    </nav>
  </header>
  <main>
${ichki}
  </main>
  <footer>
    <b>Step Academy</b> — AI orqali yaratilgan sayt © 2026 · Barcha darslar o'zbek tilida
  </footer>
</body>
</html>`;
}

function boshSahifaHTML() {
  const kartalar = DATA.kurslar
    .map(
      (k) => `    <a class="karta" href="/kurs/${esc(k.slug)}">
      <div class="ikon">${k.ikon}</div>
      <h3>${esc(k.nom)}</h3>
      <p>${esc(k.tarif)}</p>
      <span class="badge">${esc(k.daraja)}</span>
      <span class="badge">${k.darslar.length} dars</span>
    </a>`
    )
    .join("\n");

  const ichki = `<section class="hero">
      <h1>${esc(DATA.sayt.nom)} — <span>${esc(DATA.sayt.slogan)}</span></h1>
      <p>${esc(DATA.sayt.tavsif)}</p>
      <a class="btn" href="#kurslar">Kurslarni ko'rish</a>
    </section>

    <h2 class="sarlavha" id="kurslar">Bizning kurslarimiz</h2>
    <div class="kartalar">
${kartalar}
    </div>

    <h2 class="sarlavha">Qanday ishlaydi?</h2>
    <div class="kartalar">
      <div class="karta"><div class="ikon">1️⃣</div><h3>Kursni tanlang</h3><p>IT, Python, Ingliz yoki Rus tilini tanlang.</p></div>
      <div class="karta"><div class="ikon">2️⃣</div><h3>Mavzuni bosing</h3><p>if/else, sikllar kabi mavzular ro'yxatdan tanlanadi.</p></div>
      <div class="karta"><div class="ikon">3️⃣</div><h3>Videoni ko'ring</h3><p>Har bir mavzuda YouTube videosi ochiladi.</p></div>
    </div>`;

  return layout("Step Academy — Bosh sahifa", ichki);
}

function kursSahifaHTML(kurs) {
  const darslar = kurs.darslar
    .map(
      (d, i) => `    <a class="dars-qator" href="/dars/${esc(kurs.slug)}/${esc(d.slug)}">
      <div class="dars-raqam">${i + 1}</div>
      <div class="dars-info">
        <h4>${esc(d.nom)}</h4>
        <span>${esc(d.tarif)}</span>
      </div>
      <div class="dars-raqam" title="YouTube video mavjud"><span class="yt">▶</span></div>
    </a>`
    )
    .join("\n");

  const ichki = `<section class="kurs-bosh">
      <h1>${kurs.ikon} ${esc(kurs.nom)} kursi</h1>
      <p>${esc(kurs.tarif)}</p>
      <span class="badge">${esc(kurs.daraja)}</span>
      <span class="badge">${kurs.darslar.length} dars</span>
      <span class="badge">${esc(kurs.davomiyligi)}</span>
    </section>

    <h2 class="sarlavha">Darslar ro'yxati</h2>
    <div class="darslar">
${darslar}
    </div>`;

  return layout(`${kurs.nom} kursi — Step Academy`, ichki);
}

function darsSahifaHTML(kurs, dars, indeks) {
  const avvalgi = kurs.darslar[indeks - 1];
  const keyingi = kurs.darslar[indeks + 1];

  const matn = (dars.matn || [])
    .map((p) => `    <p>${esc(p)}</p>`)
    .join("\n");

  const kodBlok = dars.kod
    ? `\n    <h2 class="sarlavha">Misol</h2>\n    <pre class="kod">${esc(dars.kod)}</pre>`
    : "";

  const tugash = `<div class="dars-tugash">
      ${
        avvalgi
          ? `<a class="btn secondary" href="/dars/${esc(kurs.slug)}/${esc(avvalgi.slug)}">⬅ ${esc(avvalgi.nom)}</a>`
          : `<span></span>`
      }
      ${
        keyingi
          ? `<a class="btn" href="/dars/${esc(kurs.slug)}/${esc(keyingi.slug)}">${esc(keyingi.nom)} ➡</a>`
          : `<a class="btn" href="/kurs/${esc(kurs.slug)}">Kursga qaytish ✅</a>`
      }
    </div>`;

  const ichki = `<p><a href="/kurs/${esc(kurs.slug)}">⬅ ${esc(kurs.nom)} kursi</a></p>
    <h1 class="dars-sarlavha">${indeks + 1}. ${esc(dars.nom)}</h1>
    <p class="dars-tafrif">${esc(dars.tarif)}</p>

    <div class="video-quti">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${esc(dars.video)}"
        title="${esc(dars.nom)} — YouTube dars videosi"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>

    <div class="matn-blok">
${matn}${kodBlok}
    </div>
${tugash}`;

  return layout(`${dars.nom} — ${kurs.nom} — Step Academy`, ichki);
}

function topilmadiHTML() {
  return layout(
    "404 — Topilmadi — Step Academy",
    `<section class="hero">
      <h1>404 😕</h1>
      <p>Bunday sahifa topilmadi.</p>
      <a class="btn" href="/">Bosh sahifaga qaytish</a>
    </section>`
  );
}

function jsonYubor(res, kod, obyekt) {
  const s = JSON.stringify(obyekt, null, 2);
  res.writeHead(kod, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(s);
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  // --- Static fayllar ---
  if (url === "/style.css") {
    const fayl = path.join(__dirname, "public", "style.css");
    fs.readFile(fayl, (xato, mazmun) => {
      if (xato) {
        res.writeHead(404);
        res.end("Topilmadi");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      res.end(mazmun);
    });
    return;
  }

  // --- JSON API ---
  if (url === "/api/kurslar") {
    jsonYubor(res, 200, {
      ok: true,
      sayt: DATA.sayt,
      kurslar: DATA.kurslar.map((k) => ({
        slug: k.slug,
        nom: k.nom,
        tarif: k.tarif,
        daraja: k.daraja,
        darslar: k.darslar.map((d) => ({
          slug: d.slug,
          nom: d.nom,
          tarif: d.tarif,
          video: `https://youtu.be/${d.video}`,
        })),
      })),
    });
    return;
  }

  const qismlar = url.split("/").filter(Boolean); // masalan ["kurs","python"]

  // --- Bosh sahifa ---
  if (url === "/" || qismlar.length === 0) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(boshSahifaHTML());
    return;
  }

  // --- Kurs sahifasi: /kurs/python ---
  if (qismlar[0] === "kurs" && qismlar[1]) {
    const kurs = DATA.kurslar.find((k) => k.slug === qismlar[1]);
    if (!kurs || qismlar.length !== 2) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(topilmadiHTML());
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(kursSahifaHTML(kurs));
    return;
  }

  // --- Dars sahifasi: /dars/python/if-else ---
  if (qismlar[0] === "dars" && qismlar[1] && qismlar[2]) {
    const kurs = DATA.kurslar.find((k) => k.slug === qismlar[1]);
    const indeks = kurs ? kurs.darslar.findIndex((d) => d.slug === qismlar[2]) : -1;
    if (!kurs || indeks === -1 || qismlar.length !== 3) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(topilmadiHTML());
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(darsSahifaHTML(kurs, kurs.darslar[indeks], indeks));
    return;
  }

  // --- 404 ---
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(topilmadiHTML());
});

server.listen(PORT, () => {
  try { require("process").stdout.setEncoding("utf8"); } catch (e) {}
  console.log("[OK] Step Academy ishga tushdi!");
  console.log("-> http://localhost:" + PORT);
});
