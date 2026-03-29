require('dotenv').config();
const express = require('express');
const request = require('request');
const serveStatic = require('serve-static');

const app = express();
const baseURL = 'http://statsapi.mlb.com/api/v1/';
// const key = process.env.VUE_APP_SPORTS_KEY;
const port = process.env.PORT || 8080;

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(serveStatic(__dirname + '/dist'));

app.get('/teams', (req, res) => {
	const url = `${baseURL}teams`;

	request(url).pipe(res);
});

app.get('/teams/:teamId/roster', (req, res) => {
	const url = `${baseURL}teams/${req.params.teamId}/roster`;

	request(url).pipe(res);
});

/** Comma-separated MLB person IDs → single MLB batch request (personIds query). */
app.get('/people', (req, res) => {
	const raw = req.query.ids;
	if (raw == null || typeof raw !== 'string' || !raw.trim()) {
		res.status(400).json({ message: 'Missing or invalid ids query (comma-separated person IDs).' });
		return;
	}
	const ids = raw.trim();
	if (!/^\d+(,\d+)*$/.test(ids)) {
		res.status(400).json({ message: 'ids must be comma-separated numeric person IDs.' });
		return;
	}
	const url = `${baseURL}people?personIds=${encodeURIComponent(ids)}`;
	request(url).pipe(res);
});

app.get('/people/:playerId', (req, res) => {
	const url = `${baseURL}people/${req.params.playerId}`;

	request(url).pipe(res);
});

app.listen(port, () => {
    console.log('server is listening at port', port);
});
