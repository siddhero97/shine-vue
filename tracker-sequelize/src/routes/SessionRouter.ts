/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import { adminClientJWTRefreshTokens, RawAuthenticationRequest } from '@shared/constants';
import * as jwt from 'jsonwebtoken';
import { User } from '@models/index';
import logger from '@shared/Logger';
import { authenticateToken, phoneNumberToDatabaseFormat } from '@shared/functions';

const router = Router();
const { BAD_REQUEST, UNAUTHORIZED, OK } = StatusCodes;

const SESSIONS_EXPIRES_IN = '60s';

/**
 * Check if user is authenticated
 */
router.get('/checkAuthenticated', authenticateToken, (req: Request, res: Response) => {
     return res.status(OK).json({});
});

/**
 * Authenticate user using mobile number + password
 */
router.post('/', async (req: RawAuthenticationRequest, res: Response) => {
    
    logger.info(JSON.stringify(req.body));

    const { mobilePhone, password } = req.body;

    if (!mobilePhone || !password) {
        logger.err('No phone number or no password');
        return res.status(BAD_REQUEST).json({});
    }

    let formattedMobilePhone; // @TODO is the better code style?
    try {
        formattedMobilePhone = phoneNumberToDatabaseFormat(mobilePhone);
    } catch (e) {
        logger.err(e);
        return res.status(BAD_REQUEST).json({});
    }

    // Validate user
    logger.info('authorizing user');
    const user : User | null = await User.findOne({
        where: {
            mobilePhone: formattedMobilePhone,
        }
    });

    if (user === null) {
        logger.err('User Not found.');
        return res.status(BAD_REQUEST).json({}); // or Unauthorized
    }

    if (!user.validPassword(password)) {
        logger.err('Password is incorrect.');
        return res.status(UNAUTHORIZED).json({});
    }

    // Create the json object
    const accessToken = jwt.sign({
        accessKeyId: 0, // @TODO should this be null? Require a refactor
        surveyId: 0, // @TODO should this be null? Require a refactor
        userId: user.id
    }, String(process.env.ACCESS_TOKEN_SECRET), {  expiresIn: SESSIONS_EXPIRES_IN });
    
    // Create refresh token
    const refreshToken = jwt.sign({
        userId: user.id
    }, String(process.env.ACCESS_TOKEN_SECRET));

    // @TODO store refresh tokens using in-memory database
    // See https://github.com/Youth-Unlimited/tracker/issues/30#issuecomment-861132158
    adminClientJWTRefreshTokens.push(refreshToken);

    // Create session
    const session = {
        userId: user.id,
        userDisplayName: user.displayName,
        role: '',
    };

    return res.status(OK).json({
        accessToken,
        refreshToken,
        session
    });
});

router.post('/newToken', (req: Request, res: Response) => {
    // Check if refresh token is in database
    // if so return refresh token

    // @TODO get the userId by processing the refreshToken
    const { userId, refreshToken } = req.body; 

    // Check if refresh token is in database
    // if so return refresh token

    // @TODO store refresh tokens using in-memory database
    // See https://github.com/Youth-Unlimited/tracker/issues/30#issuecomment-861132158
    if (adminClientJWTRefreshTokens.indexOf(refreshToken) > -1) {
        logger.info('Generating a new access token');

        const accessToken = jwt.sign({
            accessKeyId: 0, // @TODO should this be null? Require a refactor
            surveyId: 0, // @TODO should this be null? Require a refactor
            userId: userId, // user.id
        }, String(process.env.ACCESS_TOKEN_SECRET), { expiresIn: SESSIONS_EXPIRES_IN });

        return res.status(OK).json({
            accessToken
        });
    }
    else {
        logger.err(`The refresh token ${refreshToken as string} is not in:`
            + `${JSON.stringify(adminClientJWTRefreshTokens)}`);
        return res.status(UNAUTHORIZED).json({}); // Return empty object?
    }

});

/**
 * Logout the user by remove refresh token from list of refresh tokens
 */
router.post('/logout', (req: Request, res: Response) => {
    // Check if refresh token is in database
    // if so return refresh token
    const { userId, refreshToken } = req.body; // @TODO use an interface for these two values?

    // Check if refresh token is in database
    // if so return refresh token

    // @TODO store refresh tokens using in-memory database
    // See https://github.com/Youth-Unlimited/tracker/issues/30#issuecomment-861132158
    const refreshTokenIndex = adminClientJWTRefreshTokens.indexOf(refreshToken);
    if (refreshTokenIndex !== -1) {
        adminClientJWTRefreshTokens.splice(refreshTokenIndex, 1);

        return res.status(OK).json({});
    }
    else {
        return res.status(UNAUTHORIZED).json({}); // Return empty object?
    }

});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
