const express = require('express');
const app = express();

const RD_API_KEY = "WPSBKRFZNAJUK3QZ647C4VOYXOOY4I5XWL5SAF3GCJU2OF4LWGOA"; 

const manifest = {
    id: "org.myaddon.rd-torrents",
    version: "1.2.0",
    name: "مجلدي الشخصي - Real Debrid",
    description: "عرض التورنتس المرفوعة في حسابك الشخصي على Stremio",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

app.get('/', (req, res) => res.json(manifest));
app.get('/manifest.json', (req, res) => res.json(manifest));

app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;

    try {
        const userTorrentsResponse = await fetch('https://api.real-debrid.com/rest/1.0/torrents', {
            headers: { 'Authorization': `Bearer ${RD_API_KEY}` }
        });
        
        if (!userTorrentsResponse.ok) throw new Error('Failed to fetch from RD');
        const torrents = await userTorrentsResponse.json();

        let streams = [];
        const matchedTorrent = torrents.find(t => t.filename.includes(id) && t.status === 'downloaded');

        if (matchedTorrent) {
            const torrentInfoResponse = await fetch(`https://api.real-debrid.com/rest/1.0/torrents/info/${matchedTorrent.id}`, {
                headers: { 'Authorization': `Bearer ${RD_API_KEY}` }
            });
            const torrentInfo = await torrentInfoResponse.json();

            if (torrentInfo.links && torrentInfo.links.length > 0) {
                const firstLink = torrentInfo.links[0];

                const unrestrictResponse = await fetch('https://api.real-debrid.com/rest/1.0/unrestrict/link', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${RD_API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `link=${encodeURIComponent(firstLink)}`
                });
                const unrestrictData = await unrestrictResponse.json();

                streams.push({
                    title: `⚡ RD | ${matchedTorrent.filename.substring(0, 30)}...`,
                    description: "رابط مباشر من ملفاتك",
                    url: unrestrictData.download
                });
            }
        }

        res.json({ streams: streams });

    } catch (error) {
        res.json({ streams: [], error: "Error fetching data" });
    }
});

module.exports = app;
