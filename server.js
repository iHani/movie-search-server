require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const redis = require('redis')

const config = require('./config')
const movies = require('./movies')

const app = express()
const client = redis.createClient()

app.use(express.static('public'))
app.use(cors())

// GET /search?keyword=[some term(s)]
app.get('/search', (req, res) => {
  const { keyword } = req.query;

  client.get(keyword, async (error, cached) => {
    if (error) { throw error; }

    if (cached) {
      console.log('Served from cache:', keyword);
      res.send(cached)

      // check if cached is older than 10 secs to refresh it
      if (Date.now() - JSON.parse(cached).lastQueriedTime > 10 * 1000) {
        try {
          const data = await movies.query(keyword);
          client.del(keyword, (err) => {
            !err && client.set(keyword, JSON.stringify(data), () => console.log('Refreshed cache for:', keyword));
          })
        } catch (error) {
          console.error(error)
        }
      }

    } else {
      try {
        const data = await movies.query(keyword);
        client.set(keyword, JSON.stringify(data), (err) => {
          !err & res.send(data)
          console.log('New cache for:', keyword)
        });
      } catch (error) {
        console.error(error)
        res.status(500).send({
          error: 'There was an error.'
        })
      }
    }
  }); // client.get

})


app.get('/cache/refresh', (req, res) => {

});

app.listen(config.port, () => {
  console.log('Server listening on port %s, Ctrl+C to stop', config.port)
})
