/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import {
    SurveySubmission, SurveySection, SurveyQuestion
} from '@models/index';
import SurveyRecorder, {
    JsonValidationError, SurveyValidationError
} from '@models/surveyrecorder';
import { RequestWithTokenData } from '@interfaces/RequestWithTokenData.interface';
import logger from '@shared/Logger';

//import { paramMissingError, ISurveySubmissionRequest } from '@shared/constants';

const router = Router();
const { BAD_REQUEST, UNPROCESSABLE_ENTITY, OK } = StatusCodes;

/******************************************************************************
 *                      Get Survey Submission by Survey id - "GET /api/surveymetadata/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    const surveyId = req.params['id'];
    const surveySubmission : SurveySubmission | null = await SurveySubmission.findByPk(
        surveyId, {
            attributes: [['id', 'surveyId']],
            include: [{
                model: SurveySection,
                as: 'catSubmissions',
                attributes: [ 'categoryId', 'tookPart' ],
                include: [{
                    model: SurveyQuestion,
                    as: 'qstnSubmissions',
                    attributes: [ 'questionId', 'answer' ]
                }]
            }]
        });
    return res.status(OK).json(surveySubmission);
});


/******************************************************************************
 *                      Put Survey Submission by Survey id - "PUT /api/surveysubmissions/:id"
 *
 * NOTE: If a SurveySubmission fails validation, it will return a 422 UNPROCESSABLE_ENTITY
 *   and the response body will contain an errors array with validation error information.
 *   In addition to the per-type validation, the `validations` field of the `Question` model
 *   accepts a space-separated list of validations.
 *   See `validatorWhitelist` for accepted validations.
 ******************************************************************************/

router.put('/:id', async (req: Request, res: Response) => {
    const surveyId = parseInt(req.params['id']);
    const token = (req as RequestWithTokenData).token;
    if (surveyId !== token.surveyId) {
        return res.status(BAD_REQUEST).json({});
    }
    // Ensure request body has the same surveyId
    if (parseInt(req.body.surveyId) !== token.surveyId) {
        return res.status(BAD_REQUEST).json({});
    }
    logger.info(JSON.stringify(req.body));

    const submission = new SurveyRecorder(req.body);
    try {
        await submission.save();
    } catch (error) {
        if (error instanceof JsonValidationError) {
            return res.status(BAD_REQUEST).json({ error: error.message });
        } else if (error instanceof SurveyValidationError) {
            return res.status(UNPROCESSABLE_ENTITY).json({ error: error.errors });
        } else if (error instanceof Error) {
            // Let the generalized error handler (in Server.ts) handle the error.
            // This means that the response will be INTERNAL_SERVER_ERROR (500).
            // NOTE: A PersistError will be handled (re-thrown) in this block.
            throw error;
        } else {
            // Some unknown object (or primitive type such as string) got thrown.
            // Wrap it in an Error object before letting the generalized error
            // handler (in Server.ts) handle the error. This means that the
            // response will be INTERNAL_SERVER_ERROR (500).
            const nonUndefinedThrownError: unknown = (typeof error !== 'undefined') ?
                error : `(Undefined)`;
            const errorMessage: string = (typeof nonUndefinedThrownError === 'string') ?
                nonUndefinedThrownError : JSON.stringify(nonUndefinedThrownError, null, 2);
            throw new Error(errorMessage);
        }
    }
    return res.status(OK).json({});
});


/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
