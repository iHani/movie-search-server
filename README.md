# Movie Search Server

This is the backend API server for [search-movie-app](https://github.com/iHani/search-movie-app)

# Get Started

1. Install and run the front-end [search-movie-app](https://github.com/iHani/movie-search-app)
2. Use `npm` or `yarn` to install and start the backend server (this repo):
* `git clone git@github.com:iHani/movie-search-server.git movie-search-server`
* `cd movie-search-server`
* `npm install`
* `node server`

The server should be live on http://localhost:3001

## Using The Server

### API Endpoint

The following endpoints are available:

| Endpoints       | Parameters          | Response         | Purpose         |
|-----------------|----------------|----------------|----------------|
| `GET /search` | query: `<string>` | { <br>totalResults:`<Number>`,<br> Response:`<Bool>`,<br> Search:`<Array>` <br>} | Fetches movie list from omdbapi.com |
| `GET /cache/refresh` | | { <br>allExistCacheRefreshed: `<Boolean>` <br>} | Loops over every cached keyword and execute `GET /search?keyword=<keyword>` |

## About

This server app was built with Expressjs, and Redis was implemented as a caching client to serve every `/search` request, and cached results that are older than 1 minutes will get refreshed. By default, omdbapi.com respond with 10 result per query, so I have implemented a function to make another trip to OMDB API to fetch the second page of that result, if applicable.


### Licence

MIT
