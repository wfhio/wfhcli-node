#!/usr/bin/env node

var Table = require('cli-table2');
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

var companies = function(site, page) {
  var table = getTable(['ID', 'Name']);
  url = site + '/api/companies.json';

  if (page != undefined) {
    url = url + '?page=' + page;
  }

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

var company = function (site, company) {
  var table = new Table({colWidths:[20,80], wordWrap:true});
  var url = site + '/api/companies/' + company + '.json';

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      table.push(
        { 'Name': json.name },
        { 'URL': json.url },
        { 'Headquarters': json.country.name },
        { 'Twitter': json.twitter }
      );
      console.log(table.toString());
    }
  });
}

var jobs = function (site, category, page) {
  var table = getTable(['ID', 'Date', 'Title', 'Company', 'Country', 'Category'])
  var url = site + '/api/jobs.json';

  if (category != undefined) {
    url = site + '/api/categories/' + category + '/jobs.json';
    if (page != undefined) {
      url = url + '?page=' + page;
    }
  }

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      for (i=0; i<json.length; i++) {
        var date = moment(json[i].created_at).format('YYYY-MM-DD');
        table.push([json[i].id,
                   date,
                   json[i].title,
                   json[i].company.name,
                   getCountry(json[i].country),
                   json[i].category.name]);
      }
      console.log(table.toString());
    }
  });
}

var job = function (site, job) {
  var table = new Table({colWidths:[20,80], wordWrap:true});
  var url = site + '/api/jobs/' + job + '.json';

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      table.push(
        { 'Title': json.title + ' @ ' + json.company.name },
        { 'Category': json.category.name },
        { 'Posted': json.created_at },
        { 'Description': json.description.replace(/\cM/g, '\n') },
        { 'Application Info': json.application_info.replace(/\cM/g, '\n') },
        { 'Country': getCountry(json.country) },
        { 'Location': json.location }
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

var getCountry = function(country) {
  if (country != undefined) {
    return country.name;
  } else {
    return 'Anywhere';
  }
}

var argv = require('minimist')(process.argv.slice(2));

switch(argv._[0]) {
  case 'categories':
    categories(site);
    break;
  case 'companies':
    companies(site, argv.page);
    break;
  case 'company':
    company(site, argv._[1]);
    break;
  case 'jobs':
    jobs(site, argv.category, argv.page);
    break;
  case 'job':
    job(site, argv._[1]);
    break;
  default:
    console.log('oops')
}
