/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { AccessKey, Survey, User } from '@models/index';
import logger from '@shared/Logger';

const router = Router();
const { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, OK } = StatusCodes;

router.post('/:accessKey/authenticate', async (req : Request, res : Response) => {
    // Retrieve the access key
    logger.info('authorizing');
    const accessKey : AccessKey | null = await AccessKey.findOne({
        where: {
            key: req.params['accessKey']
        },
        include: [{
            model: Survey,
            as: 'survey',
            include: [{
                model: User,
                as: 'user'
            }]
        }]
    });

    //logger.info(`accessKey: ${JSON.stringify(accessKey)}`);
    if (accessKey === null) {
        logger.err('Key Not found.');
        return res.status(BAD_REQUEST).json({}); // or Unauthorized
    }

    const now = Date.now();

    // Check expiration of access key
    if (now < accessKey.validAt.getTime() || now >= accessKey.expiresAt.getTime()) {
        logger.err(`Access Key ${accessKey.id} expired.`);
        return res.status(UNAUTHORIZED).json({});
    }

    // Get the user and survey id
    const survey : Survey = accessKey.survey as Survey;

    // Check expiration of survey
    if (survey.startDate !== null && survey.startDate.getTime() < now) {
        logger.err(`Survey ${survey.id} started too early.`);
        return res.status(FORBIDDEN).json({});
    }

    const user : User = survey.user as User;
    // eslint-disable-next-line max-len
    logger.info(`Authenticated accessKeyId: ${accessKey.id}, surveyId: ${survey.id}, userId: ${user.id}`);

    // Create the json object
    const accessToken = jwt.sign({
        accessKeyId: accessKey.id,
        surveyId: survey.id,
        userId: user.id
    }, String(process.env.ACCESS_TOKEN_SECRET));
    return res.status(OK).json({
        accessToken: accessToken,
        surveyId: survey.id
    });
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

 export default router;
