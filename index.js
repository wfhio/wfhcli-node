#!/usr/bin/env node

'use strict';

var program = require('commander');
var wfhlib = require('./wfhlib.js');

var site = 'https://www.wfh.io';

program
  .version('0.0.3');

program
  .command('categories')
  .description('Display job categories')
  .action(function() {
    wfhlib.makeRequest(site, '/api/categories.json', wfhlib.showCategories);
  });

program
  .command('company [id]')
  .description('Display company with id')
  .action(function(id) {
    wfhlib.makeRequest(site, '/api/companies/' + id + '.json', wfhlib.showCompany);
  });

program
  .command('companies')
  .description('Display companies')
  .option('-p, --page [id]', 'Specify page to request')
  .action(function(options) {
    var page = options.page || 1;
    wfhlib.makeRequest(site, '/api/companies.json?page=' + page, wfhlib.showCompanies);
  });

program
  .command('job [id]')
  .description('Display job with id')
  .action(function(id) {
    wfhlib.makeRequest(site, '/api/jobs/' + id + '.json', wfhlib.showJob);
  });

program
  .command('jobs')
  .description('Display jobs')
  .option('-c, --category [id]', 'Limit results by category')
  .option('-p, --page [id]', 'Specify page to request')
  .option('-s, --source [id]', 'Limit results to source')
  .action(function(options) {
    var category = options.category || undefined;
    var page = options.page || 1;
    var source = options.source || undefined;
    var uri = '/api/jobs.json?page=' + page;

    if (category !== undefined) {
      uri = uri + '&category_id=' + category;
    }

    if (source !== undefined) {
      uri = uri + '&source_id=' + source;
    }

    wfhlib.makeRequest(site, uri, wfhlib.showJobs);
  });

program
  .command('sources')
  .description('Display job sources')
  .action(function() {
    wfhlib.makeRequest(site, '/api/sources.json', wfhlib.showSources);
  });

program
  .command('*', '', {noHelp: true})
  .action(function(env) {
    program.outputHelp();
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
