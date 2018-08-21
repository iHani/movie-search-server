const omdbApi = require('omdb-client');

const API_KEY = 'a7d39165';
const api = `http://www.omdbapi.com/`;

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

async function query (query) {
  const results = await searchOMDB(query);

  if (results.Response) {
    if (results.totalResults > 10) {
      const results2 = await searchOMDB(query, 2); // query page=2 to have 20 results.Ugly, I know :/
      results['Search'] = [ ...results.Search, ...results2.Search ];
    }

    return results;
  } else {
    return ({ error: `No results found for ${query}` });
  }
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
