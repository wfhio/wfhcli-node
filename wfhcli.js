#!/usr/bin/env node

var Table = require('cli-table2');
var program = require('commander');
var moment = require('moment');
var request = require('request');

var site = 'https://www.wfh.io';

var getTable = function(header) {
  var table = new Table({
    head: header,
    style : {compact : true},
  });

  return table;
};

var getCountry = function(country) {
  if (country != undefined) {
    return country.name;
  }
  return 'Anywhere';
};

var displayId = function(id) {
  return '(' + id + ')';
};

var categories = function(site) {
  var table = getTable(['ID', 'Name']);
  url = site + '/api/categories.json';

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      for (i=0; i<json.length; i++) {
        table.push([json[i].id, json[i].name])
      }
      console.log(table.toString())
    }
  })
}

var companies = function(site, page) {
  var table = getTable(['ID', 'Name']);
  url = site + '/api/companies.json';

  if (page != undefined) {
    url = url + '?page=' + page;
  }

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      for (i=0; i<json.length; i++) {
        table.push([json[i].id, json[i].name])
      }
      console.log(table.toString())
    }
  })
}

var company = function(site, company) {
  var table = new Table({colWidths:[20,80], wordWrap:true});
  var url = site + '/api/companies/' + company + '.json';

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      table.push(
        { 'Name': json.name },
        { 'URL': json.url },
        { 'Headquarters': json.country.name },
        { 'Twitter': json.twitter }
      )
      console.log(table.toString())
    }
  })
}

var jobs = function(site, category, page, source) {
  var table = getTable(['ID', 'Posted', 'Category', 'Company', 'Title', 'Country']);
  var url = site + '/api/jobs.json?page=' + page;

  if (category != undefined) {
    url = url + '&category_id=' + category;
  }

  if (source != undefined) {
    url = url + '&source_id=' + source;
  }

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
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
  })
}

var job = function(site, job) {
  var table = new Table({colWidths:[20,80], wordWrap:true});
  var url = site + '/api/jobs/' + job + '.json';

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      table.push(
        { 'Title': json.title + ' @ ' + json.company.name + ' ' + displayId(json.company.id) },
        { 'Category': json.category.name + ' ' + displayId(json.category.id) },
        { 'Posted': json.created_at },
        { 'Description': json.description.replace(/\cM/g, '\n') },
        { 'Application Info': json.application_info.replace(/\cM/g, '\n') },
        { 'Country': getCountry(json.country) }
      )
      if (json.location != "") {
        table.push({ 'Location': json.location })
      }
      table.push({ 'Source': json.source.name + ' ' + displayId(json.source.id) })
      console.log(table.toString())
    }
  })
}

var sources = function(site) {
  var table = getTable(['ID', 'Name', 'URL']);
  var url = site + '/api/sources.json';

  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      for (i=0; i<json.length; i++) {
        table.push([json[i].id, json[i].name, json[i].url])
      }
      console.log(table.toString())
    }
  })
};

program
  .version('0.0.3')

program
  .command('categories')
  .description('Display job categories')
  .action(function(){
    categories(site)
  })

program
  .command('company [id]')
  .description('Display company with id')
  .action(function(id){
    company(site, id)
  })

program
  .command('companies')
  .description('Display companies')
  .option("-p, --page [id]", "Specify page to request")
  .action(function(options){
    var page = options.page || 1;
    companies(site, page)
  })

program
  .command('job [id]')
  .description('Display job with id')
  .action(function(id){
    job(site, id)
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
    jobs(site, category, page, source)
  })

program
  .command('sources')
  .description('Display job sources')
  .action(function() {
    sources(site)
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
