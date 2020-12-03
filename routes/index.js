var express = require('express');
const { HttpError } = require('http-errors');
const https = require('https');
const fetch = require('node-fetch');
var router = express.Router();

var api_key = 'RGAPI-6466999e-35ec-46c4-9d66-736f3c289fda';

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/users/:nickname', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Accept-Charset", "application/x-www-form-urlencoded; charset=UTF-8");
  
  const nickname = encodeURI(req.params.nickname);
  
  var url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${nickname}?api_key=${api_key}`;
  
  fetch(url)
    .then(response => response.json())
    .then(body => {
      res.send(body);
    });
});

router.get('/matchelists/:encryptAccountId', function(req, res, next) {
  const beginIndex = Number(req.query.beginIndex);
  const endIndex   = Number(req.query.endIndex);

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  const encryptAccountId = req.params.encryptAccountId;
  
  var url = `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${encryptAccountId}?api_key=${api_key}&beginIndex=${beginIndex}&endIndex=${endIndex}`;
  
  fetch(url)
    .then(response => response.json())
    .then(body => {
      res.send(body);
    });
});

router.get('/match/:gameId', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  const gameId = Number(req.params.gameId);

  var url = `https://kr.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${api_key}`;

  fetch(url)
    .then(response => response.json())
    .then(body => {
      res.send(body);
    });
  });

  router.get('/league/:encryptAccountId', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    const encryptAccountId = req.params.encryptAccountId;
    console.log("인크립트어카운트아이디", encryptAccountId);
    
    var url = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptAccountId}?api_key=${api_key}`;
    
    fetch(url)
      .then(response => response.json())
      .then(body => {
        const data = {"data" : body};
        res.send(data);
        console.log(data);
      });
  });

module.exports = router;