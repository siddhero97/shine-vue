import logger from './Logger';
import { Request, NextFunction, Response } from 'express';
import { TokenData, RequestWithTokenData } from '@interfaces/index'
import * as jwt from 'jsonwebtoken';
import StatusCodes from 'http-status-codes';
import { TwilioNotify } from '../TwilioNotify';

const { UNAUTHORIZED, FORBIDDEN } = StatusCodes;

export const pErr = (err: Error) => {
    if (err) {
        logger.err(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

export const phoneNumberToDatabaseFormat = (phoneNumber : string) => {
    return TwilioNotify.formatTwilioNumer(phoneNumber);
}

/**
 *  Parse the Bearer token from the authorization header
 *  and set the decoded values on the request object.
 */
// RequestHandler
export function authenticateToken(
    req : Request, res : Response, next : NextFunction):void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        // TODO: Remove bypass after admin client authentication is implemented.
        if (JSON.parse(process.env.BYPASS_ADMIN_CLIENT_AUTHENTICATION || '') === true) {
            next();
        } else {
            logger.err(`The accessToken is null in authenticateToken()`);
            res.sendStatus(UNAUTHORIZED);
        }
        return;
    }

    const callback : jwt.VerifyCallback =
    // eslint-disable-next-line @typescript-eslint/ban-types
    (err : jwt.VerifyErrors | null, obj : object | undefined) => {
        if (err || obj === undefined) {
            res.sendStatus(FORBIDDEN);
            return;
        }
        const tokenData = obj as TokenData;
        (req as RequestWithTokenData).token = tokenData;
        next();
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as jwt.Secret, callback);
}

/**
 *  Test the values decoded on the token.
 *  Proceed if the token has survey-level access.
 */
export function requireSurveyAccess(
    req : Request, res : Response, next : NextFunction
) : void {
    const token = (req as RequestWithTokenData).token;
    if (token == null) { // null or undefined
        res.sendStatus(UNAUTHORIZED);
        return;
    }
    // The surveyId is nonzero only if a token was created
    // through a survey access key.
    if (token.surveyId !== 0) {
        return next();
    }

    res.sendStatus(UNAUTHORIZED);
}

/**
 *  Test the values decoded on the token.
 *  Proceed if the token has admin-level access.
 */
 export function requireAdminAccess(
    req : Request, res : Response, next : NextFunction
) : void {
    const token = (req as RequestWithTokenData).token;

    if (token == null) { // null or undefined
        logger.err(`The accessToken is null in requireAdminAccess()`);
        res.sendStatus(UNAUTHORIZED);
        return;
    }
     
    // The token is legitimate if both the userId is greater than zero 
    //   and the surveyId is 0
    // @TODO check token.role instead of userId/token
     if (token.userId <= 0 || token.surveyId > 0) {
        logger.err(`The token.userId = ${token.userId} and the token.surveyId = ${token.surveyId}`);

        res.sendStatus(UNAUTHORIZED);
        return;
    }
    
    return next();
}
