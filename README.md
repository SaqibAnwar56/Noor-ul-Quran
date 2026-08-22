<div align="center">

# 📖 Noor-ul-Quran | نور القرآن

**Free online Quran reading, recitation and daily Islamic remembrance**

Surahs • Paras / Juz • Durood Paak • Ayat-ul-Kursi • 4 Quls • 99 Names of Allah • Tasbih

[![Live Site](https://img.shields.io/badge/live%20site-noor--ul--quran--beta.vercel.app-2f6fed?style=for-the-badge&logo=googlechrome&logoColor=white)](https://noor-ul-quran-beta.vercel.app/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

## 🌙 About Noor-ul-Quran

Noor-ul-Quran is a free online Quran website for Muslims who want a simple place to read the Holy Quran, listen to recitation, study translations, and access commonly recited Islamic content. The site includes all **114 Surahs**, all **30 Paras (Juz)**, Durood Paak, Ayat-ul-Kursi, the Four Quls, the 99 Names of Allah, and an online Tasbih counter.

### 🔗 Live website

**https://noor-ul-quran-beta.vercel.app/**

## ✨ Main Features

- 📗 **All 114 Quran Surahs** — Arabic text, English translation and audio recitation
- 📘 **All 30 Paras / Juz** — browse the Quran by the traditional Para division
- 🤲 **Durood Paak / Durood-e-Ibrahim** — dedicated reading and recitation section
- 🛡️ **Ayat-ul-Kursi** — Surah Al-Baqarah 2:255, with reading and audio
- 🕋 **4 Quls** — Al-Kafirun, Al-Ikhlas, Al-Falaq and An-Nas
- ✨ **99 Names of Allah / Asma-ul-Husna** — Arabic, transliteration and meanings
- 📿 **Online Tasbih counter** — common daily dhikr phrases and configurable targets
- 🔖 **Saved verses** — bookmark content locally for later reading
- 🌗 **Light and dark themes**
- 📱 **Responsive design** for mobile, tablet and desktop
- 🔎 **SEO foundations** — canonical metadata, Open Graph/Twitter cards, JSON-LD structured data, crawlable feature pages, robots.txt and XML sitemap

## 🔎 SEO landing pages

The repository now includes crawlable pages targeting useful search intents:

- `/surahs/` — Quran Surahs online
- `/paras/` — Quran Paras / Juz online
- `/durood-paak/` — Durood Paak / Durood-e-Ibrahim
- `/ayat-ul-kursi/` — Ayat-ul-Kursi online
- `/4-quls/` — Four Quls online
- `/99-names-of-allah/` — 99 Names of Allah / Asma-ul-Husna
- `/tasbih/` — online Tasbih counter

## 🛠️ Tech Stack

A dependency-free static site using HTML5, CSS3 and vanilla JavaScript. Quran text, translation and recitation data are fetched from public APIs at runtime.

| Layer | Technology |
|---|---|
| Markup | HTML5 semantic markup |
| Styling | CSS3, Grid and Flexbox |
| Behavior | Vanilla JavaScript (ES6+) |
| Quran text / translation / audio | AlQuran Cloud API |
| 99 Names of Allah | AlAdhan API |
| Account notifications | Formspree |
| Hosting | Vercel |

## 📁 Project Structure

```text
.
├── index.html
├── css/style.css
├── js/app.js
├── assets/
├── surahs/index.html
├── paras/index.html
├── durood-paak/index.html
├── ayat-ul-kursi/index.html
├── 4-quls/index.html
├── 99-names-of-allah/index.html
├── tasbih/index.html
├── robots.txt
├── sitemap.xml
└── vercel.json
```

## 🚀 Local Development

No build step is required.

```bash
git clone https://github.com/SaqibAnwar56/Noor-ul-Quran.git
cd Noor-ul-Quran
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in your browser.

## 🔐 Accounts and Privacy Note

The current sign-up/log-in flow is client-side and uses browser storage. It is not a server-backed authentication system. Users should not use it for sensitive credentials or confidential information. The site also sends account notification data through Formspree as configured by the project.

## 📈 Google Search / SEO

The project contains an XML sitemap and `robots.txt` pointing to the final Vercel domain, plus crawlable SEO landing pages for the site's main search topics. The homepage also contains title, description, Open Graph, Twitter Card and JSON-LD structured-data markup.

**Important:** SEO changes do not guarantee a Google ranking or instant indexing. After deployment, the site owner should verify `https://noor-ul-quran-beta.vercel.app/` in Google Search Console and submit `https://noor-ul-quran-beta.vercel.app/sitemap.xml`. Google then decides when and how pages are crawled and ranked.

## 🤝 Contributing

Suggestions, corrections and improvements are welcome through GitHub issues and pull requests.

## 📄 License

© Saqib Anwar. Quran text, translations and recitation audio are provided through the project's public data sources. Other project code and design are maintained in this repository.

<div align="center">

**Built with 🤲 by Saqib Anwar**

</div>
