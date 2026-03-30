require('dotenv').config();
const http = require('http');
const https = require('https');
const express = require('express');
const axios = require('axios');
const serveStatic = require('serve-static');

const app = express();
const baseURL = 'http://statsapi.mlb.com/api/v1/';
const port = process.env.PORT || 8080;

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

const mlbClient = axios.create({
	baseURL,
	httpAgent,
	httpsAgent,
	timeout: 30000,
	maxRedirects: 5,
	validateStatus: () => true,
	responseType: 'stream'
});

/** Short CDN/browser caching for MLB-shaped JSON (safe for repeat visits; rosters change more often than teams). */
const CACHE = {
	teams: 'public, max-age=300, stale-while-revalidate=60',
	roster: 'public, max-age=120, stale-while-revalidate=60',
	people: 'public, max-age=300, stale-while-revalidate=120'
};

function pipeMlbToResponse(upstream, res, cacheControl) {
	const ct = upstream.headers['content-type'];
	if (ct) {
		res.setHeader('Content-Type', ct);
	}
	res.setHeader('Cache-Control', cacheControl);
	res.status(upstream.status);

	const stream = upstream.data;
	stream.on('error', () => {
		if (!res.headersSent) {
			res.status(502).json({ message: 'Upstream connection error' });
		} else {
			res.destroy();
		}
	});
	stream.pipe(res);
}

async function proxyMlb(req, res, relativePath, cacheControl) {
	try {
		const upstream = await mlbClient.get(relativePath);
		pipeMlbToResponse(upstream, res, cacheControl);
	} catch (err) {
		console.error('MLB proxy error', err.message);
		res.status(502).json({ message: 'Failed to reach MLB API' });
	}
}

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(serveStatic(__dirname + '/dist'));

app.get('/teams', (req, res) => {
	proxyMlb(req, res, 'teams', CACHE.teams);
});

app.get('/teams/:teamId/roster', (req, res) => {
	proxyMlb(req, res, `teams/${req.params.teamId}/roster`, CACHE.roster);
});

/** Comma-separated MLB person IDs → single MLB batch request (personIds query). */
app.get('/people', (req, res) => {
	const raw = req.query.personIds ?? req.query.ids;
	if (raw == null || typeof raw !== 'string' || !raw.trim()) {
		res.status(400).json({ message: 'Missing or invalid personIds query (comma-separated person IDs).' });
		return;
	}
	const ids = raw.trim();
	if (!/^\d+(,\d+)*$/.test(ids)) {
		res.status(400).json({ message: 'personIds must be comma-separated numeric person IDs.' });
		return;
	}
	const path = `people?personIds=${encodeURIComponent(ids)}`;
	proxyMlb(req, res, path, CACHE.people);
});

app.get('/people/:playerId', (req, res) => {
	if (!/^\d+$/.test(req.params.playerId)) {
		res.status(400).json({ message: 'Invalid player id.' });
		return;
	}
	proxyMlb(req, res, `people/${req.params.playerId}`, CACHE.people);
});

app.listen(port, () => {
	console.log('server is listening at port', port);
});
