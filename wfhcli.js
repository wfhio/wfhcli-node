var Table = require('cli-table');
var parseArgs = require('minimist');
var request = require('request');
var moment = require('moment');

site = 'https://www.wfh.io';

var categories = function(site) {
  var table = getTable(['ID', 'Name']);
  url = site + '/api/categories.json';

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      for (i=0; i<json.length; i++) {
        table.push([json[i].id, json[i].name]);
      }
      console.log(table.toString());
    }
  });
}

var companies = function(site) {
  var table = getTable(['ID', 'Name']);
  url = site + '/api/companies.json';

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      for (i=0; i<json.length; i++) {
        table.push([json[i].id, json[i].name]);
      }
      console.log(table.toString());
    }
  });
}

var jobs = function (site, category) {
  var table = getTable(['ID', 'Date', 'Title', 'Company', 'Category'])

  var url = site + '/api/jobs.json';
  if (category != undefined) {
    var url = site + '/api/categories/' + category + '/jobs.json';
  }

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      for (i=0; i<json.length; i++) {
        var date = moment(json[i].created_at).format('YYYY-MM-DD');
        table.push([json[i].id, date, json[i].title, json[i].company.name, json[i].category.name]);
      }
      console.log(table.toString());
    }
  });
}

var job = function (site, job) {
  var table = new Table();
  var url = site + '/api/jobs/' + job + '.json';

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      table.push(
        { 'ID': json.id },
        { 'Title': json.title },
        { 'Description': json.description },
        { 'Application Info': json.appliation_info }
      );
      console.log(table.toString());
    }
  });
}

var getTable = function(header) {
  var table = new Table({
    head: header,
    style : {compact : true},
  });

  return table;
}

var argv = require('minimist')(process.argv.slice(2));

switch(argv._[0]) {
  case 'categories':
    categories(site);
    break;
  case 'companies':
    companies(site);
    break;
  case 'jobs':
    jobs(site, argv.category);
    break;
  case 'job':
    job(site, argv._[1]);
    break;
}
