require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const redis = require('redis')

const config = require('./config')
const movies = require('./movies')

const app = express()
const client = redis.createClient();

app.use(express.static('public'))
app.use(cors())

// Redis connect
client.on("connect", () => {
  console.log("Redis is connected ");
});

//
app.get('/search', (req, res) => {
  const { keyword } = req.query;
  // check in redis if query exists
  client.get(keyword, (error, cachedList) => {
    if (error) { throw error; }

    if (cachedList) {
      res.send(cachedList)
    } else {
      movies.query(keyword)
      .then(
        (data) => {
          // results expire from redis in 30 seconds
          client.set(keyword, JSON.stringify(data), 'EX', 30, () => console.log('save this data indefinitely'));
          //
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

app.listen(config.port, () => {
  console.log('Server listening on port %s, Ctrl+C to stop', config.port)
})
