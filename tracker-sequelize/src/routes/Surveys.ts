/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import Survey from '@models/survey';
import { paramMissingError, ISurveyRequest } from '@shared/constants';
import AccessKey from '@models/accesskey';
import logger from '@shared/Logger';

const router = Router();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                      Get All Surveys - "GET /api/surveys
 ******************************************************************************/

router.get('/', async (req: Request, res: Response) => {
    const surveys : Survey[] = await Survey.findAll();
    const [key, created] : [AccessKey, boolean]= await AccessKey.generateForSurvey(surveys[0].id);
    logger.info(`${String(key.toJSON())} Created: ${String(created)}`);

    return res.status(OK).json({surveys});
});



/******************************************************************************
 *                      Get Survey by id - "GET /api/surveys/:id"
 ******************************************************************************/

 router.get('/:id', async (req: Request, res: Response) => {
    const surveyId = req.params['id'];
    const survey : Survey | null = await Survey.findByPk(surveyId);
    return res.status(OK).json({survey});
});



/******************************************************************************
 *                       Add One - "POST /api/surveys"
 ******************************************************************************/

router.post('/', async (req: ISurveyRequest, res: Response) => {
    const { survey } = req.body;
    if (!survey) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    await Survey.create(survey);
    return res.status(CREATED).end();
});



/******************************************************************************
 *                       Update - "PUT /api/surveys"
 ******************************************************************************/

router.put('/update', async (req: ISurveyRequest, res: Response) => {
    const { survey } = req.body;
    if (!survey) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    survey.id = Number(survey.id);
    await Survey.update(survey, { where: { id: survey.id }});
    return res.status(OK).end();
});



/******************************************************************************
 *                    Delete - "DELETE /api/surveys/delete/:id"
 ******************************************************************************/

router.delete('/delete/:id', async (req: ISurveyRequest, res: Response) => {
    const { id } = req.params;
    await Survey.destroy({ where: { id: id }});
    return res.status(OK).end();
});



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
