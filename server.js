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

//
app.get('/search', (req, res) => {
  const { keyword } = req.query;
  // check in redis if query exists

  client.get(keyword, (error, cached) => {
    if (error) { throw error; }

    if (cached) {
      console.log('Served from cache', keyword);
      res.send(cached)

      client.ttl(keyword, (err, ttl) => console.log('ttl is:', ttl, keyword))

      // check if the last cache is older than 3 secs
      if (Date.now() - JSON.parse(cached).lastQueriedTime > 3000) {
        // refresh cashed for this keyword
        console.log('Cache been refreshed for', keyword);
      }

    } else {
      movies.query(keyword)
      .then(
        (data) => {
          // set keyword with 30 sec to expire
          client.setex(keyword, 30, JSON.stringify(data), () => console.log('New cache for:', keyword));
          res.send(data)
        },
        (error) => {
          console.error(error)
          res.status(500).send({
            error: 'There was an error.'
          })
        }
      )
    }
  });

})


app.get('/cache/refresh', (req, res) => {

});

app.listen(config.port, () => {
  console.log('Server listening on port %s, Ctrl+C to stop', config.port)
})
