require('dotenv').config();
const express = require('express');
const dns = require('dns');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const arr = []

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/api/shorturl/', bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/', function(req, res, next) {
  const data = JSON.parse(JSON.stringify(req.body))
  const url = data.url
  if(!arr.includes(url))  {
    const domain = url.split("//")[1].split("/")[0]
    dns.lookup(domain, function(err, address) {
      if (err) {
        res.json({error: 'invalid url'})
        return
      }
      arr.push(url)
      next()
    })
  }
}, function(req, res) {
  const data = JSON.parse(JSON.stringify(req.body))
  const url = data.url
  const idx = arr.indexOf(url)
  res.json({original_url: `${arr[idx]}`, short_url: `${idx+1}`})
})


app.get('/api/shorturl/:url', function(req, res) {
  const url = req.params.url
  if(+url && (+url - 1) <= arr.length) {
    res.redirect(arr[+url - 1])
  } else {
    res.json({error: 'invalid url'})
  }
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
