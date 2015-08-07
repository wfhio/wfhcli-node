#!/usr/bin/env node

var Table = require('cli-table2');
var program = require('commander');
var moment = require('moment');
var request = require('request');

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

program
  .version('0.0.3');

program
  .command('categories')
  .description('Display job categories')
  .action(function(){
    categories(site)
  });

program
  .command('company [id]')
  .description('Display company with id')
  .action(function(id){
    company(site, id)
  });

program
  .command('companies')
  .description('Display companies')
  .option("-p, --page [id]", "Specify page to request")
  .action(function(options){
    var page = options.page || 1;
    companies(site, page)
  });

program
  .command('job [id]')
  .description('Display job with id')
  .action(function(id){
    job(site, id)
  });

program
  .command('jobs')
  .description('Display jobs')
  .option("-c, --category [id]", "Limit results by category")
  .option("-p, --page [id]", "Specify page to request")
  .action(function(options){
    var category = options.category_id || undefined;
    var page = options.page || 1;
    jobs(site, category, page)
  });

program.parse(process.argv);
