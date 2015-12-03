'use strict';

var colors = require('colors/safe');
var marked = require('marked');
var moment = require('moment');
var request = require('request');
var Table = require('cli-table2');
var TerminalRenderer = require('marked-terminal');

marked.setOptions({
  // Define custom renderer
  renderer: new TerminalRenderer()
});

var displayId = function(id) {
  return '(' + id + ')';
};

var getCountry = function(country) {
  if (country !== undefined) {
    return country.name;
  }
  return 'Anywhere';
};

var getUrl = function(site, uri) {
  return site + uri;
};

var horiTable = function(data) {
  var table = new Table({
    head: data[0],
    style: {compact: true}
  });

  for (var i = 1; i < data.length; i++) {
    table.push(data[i]);
  }

  return table.toString();
};

var makeRequest = function(site, uri, callback) {
  request(getUrl(site, uri), function(error, response, body) {
    if (!error) {
      if (response.statusCode === 200) {
        callback(body);
      } else {
        console.log('Oopsies, we got a ' + response.statusCode + ' from: ' + uri);
        process.exit(1);
      }
    } else {
      console.log('Oopsies, we got an error: ' + error);
      process.exit(1);
    }
  });
};

var showCategories = function(body) {
  var data = [];
  var json = JSON.parse(body);

  data.push(['ID', 'Name']);
  for (var i = 0; i < json.length; i++) {
    data.push([json[i].id, json[i].name]);
  }

  console.log(horiTable(data));
};

var showCompanies = function(body) {
  var data = [];
  var json = JSON.parse(body);

  data.push(['ID', 'Name']);
  for (var i = 0; i < json.length; i++) {
    data.push([json[i].id, json[i].name]);
  }

  console.log(horiTable(data));
};

var showCompany = function(body) {
  var data = [];
  var json = JSON.parse(body);

  data.push(
    ['Name', json.name],
    ['URL', json.url]
  );
  if (json.hasOwnProperty('country')) {
    data.push(['Headquarters', json.country.name]);
  }
  data.push(['Twitter', json.twitter]);

  console.log(vertTable(data));
};

var showJobs = function(body) {
  var data = [];
  var json = JSON.parse(body);

  data.push(['ID', 'Posted', 'Category', 'Company', 'Title', 'Country']);
  for (var i = 0; i < json.length; i++) {
    var date = moment(json[i].created_at).format('YYYY-MM-DD');
    data.push(
      [
        json[i].id,
        date,
        json[i].category.name + ' ' + displayId(json[i].category.id),
        json[i].company.name + ' ' + displayId(json[i].company.id),
        json[i].title,
        getCountry(json[i].country)
      ]
    );
  }

  console.log(horiTable(data));
};

var showJob = function(body) {
  var data = [];
  var json = JSON.parse(body);
  var date = moment(json.created_at).format('YYYY-MM-DD HH:mm');

  data.push(
    ['Title', json.title + ' @ ' + json.company.name + ' ' + displayId(json.company.id)],
    ['Category', json.category.name + ' ' + displayId(json.category.id)],
    ['Posted', date],
    ['Description', marked(json.description)],
    ['Application Info', marked(json.application_info)],
    ['Country', getCountry(json.country)]
  );
  if (json.location !== '') {
    data.push(['Location', json.location]);
  };
  data.push(['Source', json.source.name + ' ' + displayId(json.source.id)]);

  console.log(vertTable(data));
};

var showSources = function(body) {
  var data = [];
  var json = JSON.parse(body);

  for (var i = 0; i < json.length; i++) {
    data.push([json[i].id, json[i].name, json[i].url]);
  }

  console.log(horiTable(data));
};

// A vertical table doesn't create headers in the left-most column, so we use
// a standard horizontal table but set the colour of the left-most values to
// red.
var vertTable = function(data) {
  var table = new Table({colWidths: [20, 80], wordWrap: true});

  for (var i = 0; i < data.length; i++) {
    table.push([colors.red(data[i][0]), data[i][1]]);
  }

  return table.toString();
};

module.exports = {
  displayId: displayId,
  getCountry: getCountry,
  getUrl: getUrl,
  horiTable: horiTable,
  makeRequest: makeRequest,
  showCategories: showCategories,
  showCompanies: showCompanies,
  showCompany: showCompany,
  showJobs: showJobs,
  showJob: showJob,
  showSources: showSources,
  vertTable: vertTable
};
