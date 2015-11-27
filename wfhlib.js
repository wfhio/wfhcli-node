'use strict';

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

var getTable = function(header) {
  var table = new Table({
    head: header,
    style: {compact: true}
  });

  return table;
};

var getUrl = function(site, uri) {
  return site + uri;
};

var makeRequest = function(site, uri, callback) {
  request(getUrl(site, uri), function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(body)
    }
  })
};

var showCategories = function(body) {
  var table = getTable(['ID', 'Name']);
  var json = JSON.parse(body);

  for (var i = 0; i < json.length; i++) {
    table.push([json[i].id, json[i].name])
  }
  console.log(table.toString())
}

var showCompanies = function(body) {
  var table = getTable(['ID', 'Name']);
  var json = JSON.parse(body);

  for (var i = 0; i < json.length; i++) {
    table.push([json[i].id, json[i].name])
  }
  console.log(table.toString())
}

var showCompany = function(body) {
  var table = new Table({colWidths: [20, 80], wordWrap: true});
  var json = JSON.parse(body);

  table.push(
    { 'Name': json.name },
    { 'URL': json.url }
  )
  if (json.hasOwnProperty('country')) {
    table.push({ 'Headquarters': json.country.name })
  }
  table.push({ 'Twitter': json.twitter })
  console.log(table.toString())
}

var showJobs = function(body) {
  var table = getTable(['ID', 'Posted', 'Category', 'Company', 'Title', 'Country']);
  var json = JSON.parse(body);

  for (var i = 0; i < json.length; i++) {
    var date = moment(json[i].created_at).format('YYYY-MM-DD');
    table.push([json[i].id,
               date,
               json[i].category.name + ' ' + displayId(json[i].category.id),
               json[i].company.name + ' ' + displayId(json[i].company.id),
               json[i].title,
               getCountry(json[i].country)])
  }

  console.log(table.toString())
}

var showJob = function(body) {
  var table = new Table({colWidths: [20, 80], wordWrap: true});
  var json = JSON.parse(body);
  var date = moment(json.created_at).format('YYYY-MM-DD HH:mm');

  table.push(
    { 'Title': json.title + ' @ ' + json.company.name + ' ' + displayId(json.company.id) },
    { 'Category': json.category.name + ' ' + displayId(json.category.id) },
    { 'Posted': date },
    { 'Description': marked(json.description) },
    { 'Application Info': marked(json.application_info) },
    { 'Country': getCountry(json.country) }
  )
  if (json.location !== '') {
    table.push({ 'Location': json.location })
  }
  table.push({ 'Source': json.source.name + ' ' + displayId(json.source.id) })
  console.log(table.toString())
}

var showSources = function(body) {
  var table = getTable(['ID', 'Name', 'URL']);
  var json = JSON.parse(body);

  for (var i = 0; i < json.length; i++) {
    table.push([json[i].id, json[i].name, json[i].url])
  }
  console.log(table.toString())
};

module.exports = {
  displayId: displayId,
  getCountry: getCountry,
  getTable: getTable,
  getUrl: getUrl,
  makeRequest: makeRequest,
  showCategories: showCategories,
  showCompanies: showCompanies,
  showCompany: showCompany,
  showJobs: showJobs,
  showJob: showJob,
  showSources: showSources
}

