import { Request } from 'express';
import { SurveyAttributes } from '@models/survey';
import { Sequelize } from 'sequelize';
import logger from '@shared/Logger';
import { exit } from 'process';
import EntityAttributes from '@interfaces/EntityAttributes';

export const paramMissingError = 'One or more of the required parameters was missing.';

// @TODO move to another file
export interface RawAuthenticationRequest extends Request {
    body: {
        mobilePhone: string,
        password: string
    }
}

export interface IEntityRequest extends Request {
    body: {
        data: EntityAttributes;
    }
}

export interface ISurveyRequest extends Request {
    body: {
        survey: SurveyAttributes;
    }
}

// @TODO Replace with in-memory database table
// See https://github.com/Youth-Unlimited/tracker/issues/30#issuecomment-861132158
export const adminClientJWTRefreshTokens: string[] = [];

// Accommodate the different variables names per environment
let prefix = '';
const env : string = process.env.environment || process.env.NODE_ENV || 'undefined';
logger.info(`Environment: ${env}`);
switch(env) {
    case 'development':
        prefix = 'DEV';
        break;
    case 'production':
        prefix = 'PROD';
        break;
    case 'test':
        prefix = 'TEST';
        break;
    default:
        logger.err(`Unrecognized environment '${env}'. Aborting.`);
        exit(1);
}

export const sequelize = new Sequelize(
    process.env[`${prefix}_DB_NAME`] || 'localhost',
    process.env[`${prefix}_DB_USERNAME`] || 'root',
    process.env[`${prefix}_DB_PASSWORD`] || '',
    {
        host: process.env[`${prefix}_DB_HOSTNAME`] || 'localhost',
        port: Number(process.env[`${prefix}_.DB_PORT`]) || 5432,
        dialect: 'postgres'
    }
);
// Log database authentication
sequelize.authenticate().then(() => {
    logger.info("Authenticated to SQL server.");
}).catch((e) => logger.err(`${String(e)}`));
