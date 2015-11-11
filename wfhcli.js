#!/usr/bin/env node

var Table = require('cli-table2');
var program = require('commander');
var moment = require('moment');
var request = require('request');
var marked = require('marked');
var TerminalRenderer = require('marked-terminal');

var site = 'https://www.wfh.io';

marked.setOptions({
  // Define custom renderer
  renderer: new TerminalRenderer()
});

var displayId = function(id) {
  return '(' + id + ')';
};

var getCountry = function(country) {
  if (country != undefined) {
    return country.name;
  }
  return 'Anywhere';
};

var getTable = function(header) {
  var table = new Table({
    head: header,
    style : {compact : true},
  });

  return table;
};

var getUrl = function(uri) {
  return site + uri;
};

var makeRequest = function(site, uri, callback) {
  request(getUrl(uri), function(error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body)
    }
  })
};

var showCategories = function(body) {
  var table = getTable(['ID', 'Name']);
  var json = JSON.parse(body);

  for (i=0; i<json.length; i++) {
    table.push([json[i].id, json[i].name])
  }
  console.log(table.toString())
}

var showCompanies = function(body) {
  var table = getTable(['ID', 'Name']);
  var json = JSON.parse(body);

  for (i=0; i<json.length; i++) {
    table.push([json[i].id, json[i].name])
  }
  console.log(table.toString())
}

var showCompany = function(body) {
  var table = new Table({colWidths:[20,80], wordWrap:true});
  var json = JSON.parse(body);

  table.push(
    { 'Name': json.name },
    { 'URL': json.url },
    { 'Headquarters': json.country.name },
    { 'Twitter': json.twitter }
  )
  console.log(table.toString())
}

var showJobs = function(body) {
  var table = getTable(['ID', 'Posted', 'Category', 'Company', 'Title', 'Country']);
  var json = JSON.parse(body);

  for (i=0; i<json.length; i++) {
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
  var table = new Table({colWidths:[20,80], wordWrap:true});
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
  if (json.location != "") {
    table.push({ 'Location': json.location })
  }
  table.push({ 'Source': json.source.name + ' ' + displayId(json.source.id) })
  console.log(table.toString())
}

var showSources = function(body) {
  var table = getTable(['ID', 'Name', 'URL']);
  var json = JSON.parse(body);

  for (i=0; i<json.length; i++) {
    table.push([json[i].id, json[i].name, json[i].url])
  }
  console.log(table.toString())
};

program
  .version('0.0.3')

program
  .command('categories')
  .description('Display job categories')
  .action(function(){
    makeRequest(site, '/api/categories.json', showCategories)
  })

program
  .command('company [id]')
  .description('Display company with id')
  .action(function(id){
    makeRequest(site, '/api/companies/' + id + '.json', showCompany)
  })

program
  .command('companies')
  .description('Display companies')
  .option("-p, --page [id]", "Specify page to request")
  .action(function(options){
    var page = options.page || 1;
    makeRequest(site, '/api/companies.json?page=' + page, showCompanies)
  })

program
  .command('job [id]')
  .description('Display job with id')
  .action(function(id){
    makeRequest(site, '/api/jobs/' + id + '.json', showJob)
  })

program
  .command('jobs')
  .description('Display jobs')
  .option("-c, --category [id]", "Limit results by category")
  .option("-p, --page [id]", "Specify page to request")
  .option("-s, --source [id]", "Limit results to source")
  .action(function(options){
    var category = options.category || undefined;
    var page = options.page || 1;
    var source = options.source || undefined;
    var uri = '/api/jobs.json?page=' + page;

    if (category != undefined) {
      uri = uri + '&category_id=' + category;
    }

    if (source != undefined) {
      uri = uri + '&source_id=' + source;
    }

    makeRequest(site, uri, showJobs)
  })

program
  .command('sources')
  .description('Display job sources')
  .action(function() {
    makeRequest(site, '/api/sources.json', showSources)
  })

program
  .command('*', '', {noHelp: true})
  .action(function(env){
    program.outputHelp();
})

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)
