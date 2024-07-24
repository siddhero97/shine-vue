// Configure environment sequelize to use environment variables provided in src/pre-start/env

const node_env = process.env.NODE_ENV || 'development';
let resourceLimits;

// Workaround for requiring the correct library depending on node version
if (Number(process.versions.node.split('.')[0]) < 12) {
  ({ resourceLimits } = require('node:worker_threads'));
} else {
  ({ resourceLimits } = require('worker_threads'));
}

// In production the environment is moved to the dist folder.
const srcdir = (node_env === 'production') ? 'dist' : 'src';

// Source the correct environment
const path = require('path');
const result = require('dotenv').config({
  path: path.resolve(process.cwd(), srcdir, 'pre-start', 'env', `${node_env}.env`)
});

if (result.error) {
  throw result.error;
}

module.exports = {
    development: {
      username: process.env.DEV_DB_USERNAME,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      host: process.env.DEV_DB_HOSTNAME || 'localhost',
      dialect: 'postgres'
    },
    test: {
      username: process.env.TEST_DB_USERNAME,
      password: process.env.TEST_DB_PASSWORD,
      database: process.env.TEST_DB_NAME,
      host: process.env.TEST_DB_HOSTNAME || 'localhost',
      dialect: 'postgres'
    },
    production: {
      username: process.env.PROD_DB_USERNAME,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: process.env.PROD_DB_HOSTNAME || 'localhost',
      dialect: 'postgres'
    }
  };