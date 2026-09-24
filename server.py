# Step Academy — Python server (standart kutubxonasiz, faqat stdlib)
from http.server import HTTPServer, BaseHTTPRequestHandler
import json, os, sys, urllib.parse

# Konsol encoding muammosini oldini olish (Windows cp1251 hollari uchun)
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

PORT = int(os.environ.get("PORT", 3000))
DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(DIR, "data", "kurslar.json"), encoding="utf-8") as f:
    DATA = json.load(f)


def esc(s):
    """HTML ichidagi xavfli belgilarni himoya qilish"""
    return (
        str(s if s is not None else "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def layout(title, body):
    nav = "\n        ".join(
        f'<a href="/kurs/{esc(k["slug"])}">{esc(k["nom"])}' + "</a>"
        for k in DATA["kurslar"]
    )
    return f"""<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(DATA['sayt']['tavsif'])}">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <nav class="nav">
      <a class="logo" href="/">Step<span>Academy</span></a>
      <div class="nav-links">
        <a href="/">Bosh sahifa</a>
        {nav}
        <a href="/api/kurslar">API</a>
      </div>
    </nav>
  </header>
  <main>
{body}
  </main>
  <footer>
    <b>Step Academy</b> — AI orqali yaratilgan sayt © 2026 · Barcha darslar o'zbek tilida
  </footer>
</body>
</html>"""


def home_page():
    kartalar = "\n".join(
        f"""    <a class="karta" href="/kurs/{esc(k['slug'])}">
      <div class="ikon">{k['ikon']}</div>
      <h3>{esc(k['nom'])}</h3>
      <p>{esc(k['tarif'])}</p>
      <span class="badge">{esc(k['daraja'])}</span>
      <span class="badge">{len(k['darslar'])} dars</span>
    </a>"""
        for k in DATA["kurslar"]
    )
    body = f"""<section class="hero">
      <h1>{esc(DATA['sayt']['nom'])} — <span>{esc(DATA['sayt']['slogan'])}</span></h1>
      <p>{esc(DATA['sayt']['tavsif'])}</p>
      <a class="btn" href="#kurslar">Kurslarni ko'rish</a>
    </section>

    <h2 class="sarlavha" id="kurslar">Bizning kurslarimiz</h2>
    <div class="kartalar">
{kartalar}
    </div>

    <h2 class="sarlavha">Qanday ishlaydi?</h2>
    <div class="kartalar">
      <div class="karta"><div class="ikon">1️⃣</div><h3>Kursni tanlang</h3><p>IT, Python, Ingliz yoki Rus tilini tanlang.</p></div>
      <div class="karta"><div class="ikon">2️⃣</div><h3>Mavzuni bosing</h3><p>if/else, sikllar kabi mavzular ro'yxatdan tanlanadi.</p></div>
      <div class="karta"><div class="ikon">3️⃣</div><h3>Videoni ko'ring</h3><p>Har bir mavzuda YouTube videosi ochiladi.</p></div>
    </div>"""
    return layout("Step Academy — Bosh sahifa", body)


def course_page(kurs):
    darslar = "\n".join(
        f"""    <a class="dars-qator" href="/dars/{esc(kurs['slug'])}/{esc(d['slug'])}">
      <div class="dars-raqam">{i + 1}</div>
      <div class="dars-info">
        <h4>{esc(d['nom'])}</h4>
        <span>{esc(d['tarif'])}</span>
      </div>
      <div class="dars-raqam" title="YouTube video mavjud"><span class="yt">▶</span></div>
    </a>"""
        for i, d in enumerate(kurs["darslar"])
    )
    body = f"""<section class="kurs-bosh">
      <h1>{kurs['ikon']} {esc(kurs['nom'])} kursi</h1>
      <p>{esc(kurs['tarif'])}</p>
      <span class="badge">{esc(kurs['daraja'])}</span>
      <span class="badge">{len(kurs['darslar'])} dars</span>
      <span class="badge">{esc(kurs['davomiyligi'])}</span>
    </section>

    <h2 class="sarlavha">Darslar ro'yxati</h2>
    <div class="darslar">
{darslar}
    </div>"""
    return layout(f"{kurs['nom']} kursi — Step Academy", body)


def lesson_page(kurs, dars, i):
    avvalgi = kurs["darslar"][i - 1] if i > 0 else None
    keyingi = kurs["darslar"][i + 1] if i + 1 < len(kurs["darslar"]) else None

    matn = "\n".join(f"    <p>{esc(p)}</p>" for p in dars.get("matn", []))
    kod_blok = ""
    if dars.get("kod"):
        kod_blok = (
            '\n    <h2 class="sarlavha">Misol</h2>\n'
            f'    <pre class="kod">{esc(dars["kod"])}</pre>'
        )

    chap = (
        f'<a class="btn secondary" href="/dars/{esc(kurs["slug"])}/{esc(avvalgi["slug"])}">⬅ {esc(avvalgi["nom"])}</a>'
        if avvalgi else "<span></span>"
    )
    ong = (
        f'<a class="btn" href="/dars/{esc(kurs["slug"])}/{esc(keyingi["slug"])}">{esc(keyingi["nom"])} ➡</a>'
        if keyingi
        else f'<a class="btn" href="/kurs/{esc(kurs["slug"])}">Kursga qaytish ✅</a>'
    )

    body = f"""<p><a href="/kurs/{esc(kurs['slug'])}">⬅ {esc(kurs['nom'])} kursi</a></p>
    <h1 class="dars-sarlavha">{i + 1}. {esc(dars['nom'])}</h1>
    <p class="dars-tafrif">{esc(dars['tarif'])}</p>

    <div class="video-quti">
      <iframe
        src="https://www.youtube-nocookie.com/embed/{esc(dars['video'])}"
        title="{esc(dars['nom'])} — YouTube dars videosi"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>

    <div class="matn-blok">
{matn}{kod_blok}
    </div>

    <div class="dars-tugash">
      {chap}
      {ong}
    </div>"""
    return layout(f"{dars['nom']} — {kurs['nom']} — Step Academy", body)


def not_found():
    return layout(
        "404 — Topilmadi — Step Academy",
        """<section class="hero">
      <h1>404 😕</h1>
      <p>Bunday sahifa topilmadi.</p>
      <a class="btn" href="/">Bosh sahifaga qaytish</a>
    </section>""",
    )


def api_data():
    return {
        "ok": True,
        "sayt": DATA["sayt"],
        "kurslar": [
            {
                "slug": k["slug"],
                "nom": k["nom"],
                "tarif": k["tarif"],
                "daraja": k["daraja"],
                "darslar": [
                    {
                        "slug": d["slug"],
                        "nom": d["nom"],
                        "tarif": d["tarif"],
                        "video": f"https://youtu.be/{d['video']}",
                    }
                    for d in k["darslar"]
                ],
            }
            for k in DATA["kurslar"]
        ],
    }


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, ctype, body):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urllib.parse.unquote(self.path.split("?")[0])

        if url == "/style.css":
            try:
                with open(os.path.join(DIR, "public", "style.css"), "rb") as f:
                    self._send(200, "text/css; charset=utf-8", f.read())
            except OSError:
                self._send(404, "text/plain; charset=utf-8", "Topilmadi")
            return

        if url == "/api/kurslar":
            self._send(200, "application/json; charset=utf-8",
                       json.dumps(api_data(), ensure_ascii=False, indent=2))
            return

        parts = [p for p in url.split("/") if p]

        if not parts:
            self._send(200, "text/html; charset=utf-8", home_page())
            return

        if parts[0] == "kurs" and len(parts) == 2:
            kurs = next((k for k in DATA["kurslar"] if k["slug"] == parts[1]), None)
            if kurs:
                self._send(200, "text/html; charset=utf-8", course_page(kurs))
            else:
                self._send(404, "text/html; charset=utf-8", not_found())
            return

        if parts[0] == "dars" and len(parts) == 3:
            kurs = next((k for k in DATA["kurslar"] if k["slug"] == parts[1]), None)
            indeks = (
                next((i for i, d in enumerate(kurs["darslar"])
                      if d["slug"] == parts[2]), -1)
                if kurs else -1
            )
            if kurs and indeks >= 0:
                self._send(200, "text/html; charset=utf-8",
                           lesson_page(kurs, kurs["darslar"][indeks], indeks))
            else:
                self._send(404, "text/html; charset=utf-8", not_found())
            return

        self._send(404, "text/html; charset=utf-8", not_found())

    def log_message(self, fmt, *args):
        print(f"[Step Academy] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    server = HTTPServer(("", PORT), Handler)
    print(f"✅ Step Academy ishga tushdi! → http://localhost:{PORT}")
    server.serve_forever()
