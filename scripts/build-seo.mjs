import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist');
const SITE = 'https://noor-ul-quran-beta.vercel.app';
const API = 'https://api.alquran.cloud/v1';

const surahNames = [
  'Al-Fatihah','Al-Baqarah','Aal-E-Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha','Al-Anbiya','Al-Hajj','Al-Muminun','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Maarij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat','Al-Qariah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Maun','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'
];

const paraNames = ['Alif Laam Meem','Sayaqool','Tilkar Rusul','Lan Tanaaloo','Wal Muhsanat','La Yuhibbullah','Wa Idha Samiu','Wa Lau Annana','Qalal Mala','Wa Alamu','Yatadhiruna','Wa Ma Min Dabbah','Wa Ma Ubarriu','Rubama','Subhanalladhi','Qal Alam','Iqtaraba','Qad Aflaha','Wa Qalalladhina','Amman Khalaqa','Utlu Ma Oohiya','Wa Man Yaqnut','Wa Mali','Faman Adhlam','Ilayhi Yuraddu','Ha Meem','Qala Fama Khatbukum','Qad Sami Allah','Tabarakalladhi','Amma'];

function esc(value = '') {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function pageTemplate({title, description, canonical, heading, intro, body, appHash}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Noor-ul-Quran">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="stylesheet" href="/css/style.css">
<style>body{max-width:900px;margin:auto;padding:32px 20px;font-family:system-ui,sans-serif;line-height:1.7}h1{line-height:1.2}.quran-verse{padding:20px;margin:16px 0;border:1px solid #ddd;border-radius:12px}.arabic{font-size:2rem;line-height:2;text-align:right;font-family:Amiri,serif}.translation{margin-top:12px}.top-link{display:inline-block;margin-bottom:24px}</style>
<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org', '@type':'WebPage', name:title, url:canonical, description, isPartOf:{'@type':'WebSite',name:'Noor-ul-Quran',url:SITE}, inLanguage:'en'})}</script>
</head>
<body>
<a class="top-link" href="/">← Noor-ul-Quran Home</a>
<h1>${esc(heading)}</h1>
<p>${esc(intro)}</p>
${body}
<p><a href="${appHash}">Open this page in the interactive Noor-ul-Quran reader →</a></p>
</body></html>`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function main() {
  await fs.rm(OUT, {recursive:true, force:true});
  await fs.mkdir(OUT, {recursive:true});

  const entries = [];
  const copyItems = ['index.html','css','js','assets'];
  for (const item of copyItems) {
    const src = path.join(ROOT,item);
    try { await fs.cp(src, path.join(OUT,item), {recursive:true}); } catch {}
  }

  const addPage = async (urlPath, html) => {
    const file = path.join(OUT, urlPath, 'index.html');
    await fs.mkdir(path.dirname(file), {recursive:true});
    await fs.writeFile(file, html, 'utf8');
    entries.push(urlPath.endsWith('/') ? urlPath : `${urlPath}/`);
  };

  await addPage('surahs', pageTemplate({
    title:'Read Quran Online by Surah | 114 Surahs | Noor-ul-Quran',
    description:'Read all 114 Surahs of the Holy Quran online with Arabic text, English translation and recitation audio on Noor-ul-Quran.',
    canonical:`${SITE}/surahs/`, heading:'Read the Quran by Surah',
    intro:'Browse all 114 chapters of the Quran. Each Surah has Arabic text, English translation and recitation audio.',
    body:`<ul>${surahNames.map((n,i)=>`<li><a href="/surah/${i+1}/">Surah ${i+1}: ${esc(n)}</a></li>`).join('')}</ul>`, appHash:'/#surahs'
  }));

  await addPage('paras', pageTemplate({
    title:'Read Quran Online by Para (Juz) | 30 Paras | Noor-ul-Quran',
    description:'Read all 30 Paras (Juz) of the Holy Quran online with Arabic text, English translation and recitation audio.',
    canonical:`${SITE}/paras/`, heading:'Read the Quran by Para (Juz)',
    intro:'Browse all 30 traditional Quran Paras (Juz), suitable for daily reading and completing the Quran over a month.',
    body:`<ul>${paraNames.map((n,i)=>`<li><a href="/para/${i+1}/">Para ${i+1}: ${esc(n)}</a></li>`).join('')}</ul>`, appHash:'/#paras'
  }));

  const resourcePages = [
    ['durood-paak','Durood Paak','Read Durood Paak (Durood-e-Ibrahim / Salat al-Ibrahimiyyah) online in Arabic with transliteration and English meaning.','/#durood'],
    ['ayat-ul-kursi','Ayat-ul-Kursi','Read Ayat-ul-Kursi, Surah Al-Baqarah 2:255, online in Arabic with English translation and recitation.','/#kursi'],
    ['4-quls','The Four Quls','Read the Four Quls: Al-Kafirun, Al-Ikhlas, Al-Falaq and An-Nas online in Arabic with translation and audio.','/#quls'],
    ['99-names-of-allah','99 Names of Allah','Explore the 99 Names of Allah (Asma-ul-Husna) with Arabic names, transliteration and meanings.','/#names'],
    ['tasbih','Tasbih Counter','Use the free Noor-ul-Quran Tasbih counter for SubhanAllah, Alhamdulillah, Allahu Akbar and Astaghfirullah.','/#tasbih']
  ];
  for (const [slugName,name,desc,hash] of resourcePages) await addPage(slugName,pageTemplate({title:`${name} | Noor-ul-Quran`,description:desc,canonical:`${SITE}/${slugName}/`,heading:name,intro:desc,body:'<p>Noor-ul-Quran provides this Islamic resource as part of its free online Quran and daily remembrance platform.</p>',appHash:hash}));

  for (let i=1;i<=114;i++) {
    try {
      const data = (await fetchJson(`${API}/surah/${i}/quran-uthmani,en.sahih,ar.alafasy`)).data;
      const name = data?.englishName || surahNames[i-1] || `Surah ${i}`;
      const arabicName = data?.name || '';
      const description = `Read Surah ${i} ${name} online with Arabic Quran text, English translation and recitation audio on Noor-ul-Quran.`;
      const body = (data?.ayahs || []).map(a=>`<article class="quran-verse"><div><strong>Ayah ${a.numberInSurah}</strong></div><div class="arabic" lang="ar" dir="rtl">${esc(a.text)}</div></article>`).join('');
      await addPage(`surah/${i}`,pageTemplate({title:`Surah ${i} ${name} | Read Quran Online | Noor-ul-Quran`,description,canonical:`${SITE}/surah/${i}/`,heading:`Surah ${i}: ${name}`,intro:`${arabicName}. Read the complete Surah with Quranic Arabic text and access the interactive reader for translation and audio.`,body,appHash:`/#surah/${i}`}));
    } catch (error) { console.error(error); }
  }

  for (let i=1;i<=30;i++) {
    try {
      const data = (await fetchJson(`${API}/juz/${i}/quran-uthmani,en.sahih,ar.alafasy`)).data;
      const name = paraNames[i-1];
      const description = `Read Para ${i} (${name}) of the Holy Quran online with Arabic text, English translation and recitation audio.`;
      const body = (data?.ayahs || []).map(a=>`<article class="quran-verse"><div><strong>${esc(a.surah?.englishName || '')} — Ayah ${a.numberInSurah || ''}</strong></div><div class="arabic" lang="ar" dir="rtl">${esc(a.text)}</div></article>`).join('');
      await addPage(`para/${i}`,pageTemplate({title:`Para ${i} ${name} | Quran Juz | Noor-ul-Quran`,description,canonical:`${SITE}/para/${i}/`,heading:`Para ${i}: ${name}`,intro:`Read Para ${i} of the Quran online. This Juz contains Quranic Arabic text and is available in the interactive Noor-ul-Quran reader with translation and audio.`,body,appHash:`/#para/${i}`}));
    } catch (error) { console.error(error); }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['',...entries].map(p=>`  <url><loc>${SITE}/${p}</loc><changefreq>${p===''?'weekly':'monthly'}</changefreq><priority>${p===''?'1.0':p.startsWith('surah/')?'0.8':p.startsWith('para/')?'0.75':'0.8'}</priority></url>`).join('\n')}\n</urlset>\n`;
  await fs.writeFile(path.join(OUT,'sitemap.xml'),sitemap,'utf8');
  await fs.writeFile(path.join(OUT,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+SITE+'/sitemap.xml\n','utf8');
  console.log(`SEO build complete: ${entries.length} indexable pages.`);
}

main().catch(error => { console.error(error); process.exit(1); });
