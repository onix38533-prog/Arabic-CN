const express = require('express');
const app = express();

const manifest = {
    id: "org.myaddon.vercel",
    version: "1.0.0",
    name: "إضافتي الشخصية من الجوال",
    description: "إضافة Stremio مخصصة ومستضافة عبر الجوال",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/', (req, res) => res.json(manifest));
app.get('/manifest.json', (req, res) => res.json(manifest));

app.get('/stream/:type/:id.json', (req, res) => {
    const streams = [
        {
            title: "رابط تجريبي بجودة 1080p",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
    ];
    res.json({ streams: streams });
});

module.exports = app;
