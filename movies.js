const omdbApi = require('./OMDBAPI');

const API_KEY = process.env.REACT_APP_MODB_TOKEN;

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

async function query (query) {
  try {
    const response = await searchOMDB(query);
    if (response.Response && response.totalResults > 10) {
      const results2 = await searchOMDB(query, 2); // query page=2 to have 20 results.Ugly, I know :/
      response['Search'] = [ ...response.Search, ...results2.Search ];
    }
    response.lastQueriedTime = Date.now();
    return response;
  } catch (error) {
    return ({ Response: false, error: 'No response from omdbapi.com' })
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
