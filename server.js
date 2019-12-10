const express = require('express');
const request = require('request');
const serveStatic = require('serve-static');

const app = express();
const baseURL = `https://api.sportsdata.io/v3/mlb/scores/json/`;
const key = `a5ab22c5a0e3407c9cc72de8ec2561ae`;
const port = process.env.PORT || 8080;

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(serveStatic(__dirname + '/dist'));

app.get('/teams', (req, res) => {
	const url = `${baseURL}teams?key=${key}`;

	request(url).pipe(res);
});

app.get('/players/:team', (req, res) => {
	const url = `${baseURL}players/${req.params.team}?key=${key}`;

	request(url).pipe(res);
});

app.listen(port, () => {
    console.log(`server is listening at port`, port);
});
