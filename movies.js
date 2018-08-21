// const omdbApi = require('omdb-client');
const omdbApi = require('./OMDBAPI');

const fetch = require('node-fetch');

const API_KEY = 'a7d39165';
const api = `http://www.omdbapi.com/`;

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// const query = async (query, page = 1) => {
//   const response = await fetchOMDB(query)
//   const json = await response.json()
//   if (json.Response) {
//     if (json.totalResults > 10) {
//       const second10 = await fetchOMDB(query, 2)
//       console.log('second10', second10);
//       // json.['Search'] = [ ...json.Search, ...second10.Search ];
//     }
//   }
//   return json;
// }
//
// const fetchOMDB = (query, page = 1) => fetch(`${api}/?apikey=${API_KEY}&s=${query}&page=${page}`, { timeout: 1000 });

async function query (query) {
  const response = await searchOMDB(query);
  if (response.Response && response.totalResults > 10) {
    const results2 = await searchOMDB(query, 2); // query page=2 to have 20 results.Ugly, I know :/
    response['Search'] = [ ...response.Search, ...results2.Search ];
  }
  response.lastQueriedTime = Date.now();
  return response;
}

function searchOMDB (query, page = 1) {
  return new Promise((res, rej) => {
    omdbApi.search({ apiKey: API_KEY, query, page }, (err, data) => {
      if (err) { rej(err); }
      res(data);
    });
  });
}

module.exports = {
  query,
}
