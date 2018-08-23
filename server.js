require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');

const config = require('./config');
const movies = require('./movies');

const app = express();
const client = redis.createClient();

app.use(express.static('public'));
app.use(cors());

// GET /search?keyword=[some term(s)]
app.get('/search', (req, res) => {
  const { keyword } = req.query;

  client.hget(`keyword`, keyword, async (error, cached) => {
    if (error) { throw error; }

    if (cached) {
      res.send(cached);
      console.log('Served from cache:', keyword);

      // check if cached is older than 10 secs to refresh it
      if (Date.now() - JSON.parse(cached).lastQueriedTime > 10 * 1000) {
        try {
          const result = await movies.query(keyword);
          client.hset(`keyword`, keyword, JSON.stringify(result), () => {
            console.log('Refreshed cache for:', keyword);
            return
        })
      } catch (error) {
          console.error(error);
        }
      }

    } else {
      try {
        const result = await movies.query(keyword);
        client.hset(`keyword`, keyword, JSON.stringify(result), (err) => {
          !err && res.send(result);
          console.log('New cache for:', keyword);
        });
      } catch (error) {
        res.status(500).send({
          error: 'There was an error.'
        });
      }
    }
  }); // client.get

})

// GET /cache/refresh
app.get('/cache/refresh', (req, res) => {
  client.hscan(`keyword`, 0, (err, data) => {
    // data[0] is the courser position, data[1] is the array of hashed values
    // data[1] is % 2 because HSET save values in array of [ key1, data1, key2, data2,..], and we
    // need to get keywords only (first one evenly)
    data[1].map((keyword, index) => index % 2 === 0 ? movies.query(keyword) : keyword);
  });
  // TODO better way to verify success of movies.query(s)
  res.send({ allExistCacheRefreshed: true });
  console.log('All cache has been refreshed');
});

app.listen(config.port, () => {
  console.log('Server listening on port %s, Ctrl+C to stop', config.port);
})
