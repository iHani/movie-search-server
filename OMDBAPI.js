// Based on https://github.com/bbraithwaite/omdb-client and without validation
'use strict';

/**
* Module dependencies.
*/

var http = require('json-http');

/**
* Build the url string from the parameters.
*
* @param {Object} params
* @return {String} url to call omdbapi.com
* @api private
*/
var _createUrl = function(params) {

  var baseUrl = 'http://www.omdbapi.com/';
  var query = '?';

  // mandatory
  query += 's='.concat(encodeURIComponent(params.query));

  if (params.year) {
    query += '&y='.concat(params.year);
  }

  if (params.type) {
    query += '&type='.concat(params.type);
  }

  if (params.apiKey) {
    query += '&apikey='.concat(params.apiKey);
  }

  if (params.page) {
    query += '&page='.concat(params.page);
  }

  return baseUrl.concat(query, '&r=json&v=1');
};

/**
* Search film content from the imdb http service.
*
* @param {Object} params
* @param {Function} callback
* @api public
*/
module.exports.search = function(params, callback) {

  var timeout = (params) ? params.timeout || 10000 : 10000;

  http.getJson(_createUrl(params), timeout, function handleResponse(err, data) {

    if (err) {
      callback(err, null);
      return;
    }

    if (data.Error) {
      callback(data.Error, null);
    } else {
      callback(null, data);
    }

  });

};
