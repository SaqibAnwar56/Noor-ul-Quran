<div align="center">

# 📖 Noor-ul-Quran | نور القرآن

**A free online Qur'an — read, recite, and reflect**

Surahs • Paras • Durood Paak • Ayat-ul-Kursi • 4 Quls • 99 Names of Allah • Tasbih

[![Live Site](https://img.shields.io/badge/live%20site-noor--ul--quran.infinityfreeapp.com-2f6fed?style=for-the-badge&logo=googlechrome&logoColor=white)](https://noor-ul-quran.infinityfreeapp.com/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

[![Status](https://img.shields.io/badge/status-live-17c3f2?style=flat-square)](https://noor-ul-quran.infinityfreeapp.com/)
![Responsive](https://img.shields.io/badge/responsive-yes-success?style=flat-square)
![Framework](https://img.shields.io/badge/framework-none%20%2F%20vanilla-lightgrey?style=flat-square)

</div>

## 📖 About

Noor-ul-Quran is a single, calm place for daily Qur'an reading and remembrance. It brings the complete Qur'an — by Surah or by the traditional 30-Para division — together with the essentials Muslims turn to every day: Durood Paak, Ayat-ul-Kursi, the Four Quls, and the 99 Names of Allah, all with Arabic script, English translation, and audio recitation.

> 🔗 **Live:** [noor-ul-quran.infinityfreeapp.com](https://noor-ul-quran.infinityfreeapp.com/)

## ✨ Features

- 📗 **All 114 Surahs** — searchable, with Arabic (Uthmani script), English translation, and verse-by-verse recitation audio
- 📘 **All 30 Paras (Juz)** — shown by their traditional Arabic name (Alif Laam Meem, Sayaqool, Amma…)
- 🤲 **Durood Paak** (Durood-e-Ibrahim) — with real recorded recitation audio
- 🛡️ **Ayat-ul-Kursi** — the Verse of the Throne, with audio
- 🕋 **The Four Quls** — Al-Kafirun, Al-Ikhlas, Al-Falaq, An-Nas
- ✨ **99 Names of Allah** (Asma-ul-Husna) — Arabic, transliteration, and meaning
- 📿 **Tasbih counter** — SubhanAllah / Alhamdulillah / Allahu Akbar / Astaghfirullah, with switchable targets
- 🔖 **Save verses** — bookmark any verse or dua to revisit later
- 🔐 **Sign up / log in gate** — the homepage is open to everyone; reading content requires a free account
- 🌗 **Light / dark theme toggle**
- 📱 **Fully responsive** — mobile-first, works on phone, tablet, and desktop
- 🔎 **SEO-ready** — structured data (WebSite, Organization, FAQPage), Open Graph/Twitter tags, sitemap & robots.txt

## 🛠️ Tech Stack

A dependency-free static site — no framework, no build step, no bundler.

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 — custom properties, Grid & Flexbox |
| Behavior | Vanilla JavaScript (ES6+) |
| Qur'an text, translation & audio | [AlQuran Cloud API](https://alquran.cloud/api) |
| 99 Names of Allah | [AlAdhan API](https://aladhan.com/asma-al-husna-api) |
| Account notifications | [Formspree](https://formspree.io/) — serverless email delivery |
| Hosting | [InfinityFree](https://www.infinityfree.com/) |

## 📁 Project Structure

```text
.
├── index.html        # All page markup and content
├── css/style.css      # Theming, layout, responsive rules
├── js/app.js          # Navigation, auth gate, API calls, audio, bookmarks
├── assets/            # Hero illustration, OG social preview image
├── robots.txt         # Search engine crawl rules
└── sitemap.xml         # Sitemap for search engines
```

## 🚀 Getting Started

No build tools or dependencies required.

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
python3 -m http.server 8000   # then visit http://localhost:8000
```

Or just open `index.html` directly in a browser (Qur'an text, translation, audio, and the Names of Allah are fetched live, so an internet connection is needed).

## 🌐 Deployment

Static site — hostable anywhere. **Currently deployed on [InfinityFree](https://www.infinityfree.com/)** at [noor-ul-quran.infinityfreeapp.com](https://noor-ul-quran.infinityfreeapp.com/).

## 🔐 Accounts

Sign-up/log-in runs entirely client-side (no server/database), so accounts unlock the site per device/browser rather than globally. Every sign-up and log-in is also relayed by [Formspree](https://formspree.io/) to the site owner's email.

## 🔎 SEO

Includes structured data (JSON-LD — WebSite, Organization, FAQPage), Open Graph/Twitter Card tags, a rendered social preview image, `robots.txt`, and `sitemap.xml`.

## 🤝 Contributing

Suggestions and corrections are welcome — open an issue or pull request.

## 📬 Contact

📞 **Phone / WhatsApp:** +92 334 9867384
✉️ **Email:** [saqibabro595@gmail.com](mailto:saqibabro595@gmail.com)

## 📄 License

© Saqib Anwar. Qur'an text, translations, and recitation audio are served via open, publicly available sources (AlQuran Cloud, AlAdhan). All other content, design, and code are original or used with permission.

<div align="center">

**Built with 🤲 by Saqib Anwar**

</div>
