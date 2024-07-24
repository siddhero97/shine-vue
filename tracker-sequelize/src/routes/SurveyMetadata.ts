/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import {
    SurveyMetadata, QuestionMetadata, Category, Question, UserPreference
} from '@models/index';

//import { paramMissingError, ISurveyMetadataRequest } from '@shared/constants';

const router = Router();
const { /*BAD_REQUEST, CREATED,*/ OK } = StatusCodes;

/******************************************************************************
 *                      Get Survey Metadata by Survey id - "GET /api/surveymetadata/:id"
 ******************************************************************************/

 router.get('/:id', async (req: Request, res: Response) => {
    const surveyId = req.params['id'];
    const surveyMetadata : SurveyMetadata | null = await SurveyMetadata.findByPk(
        surveyId, {
            attributes: [['id', 'surveyId'], 'userId', 'displayName', 'surveyDate', 'startDate'],
            // Ordering in nested includes has different syntax.
            // See: https://github.com/sequelize/sequelize/issues/4553
            order: [
                [ { model: Category, as: 'catMetaList'}, 'order', 'ASC' ],
                [
                    { model: Category, as: 'catMetaList'},
                    { model: QuestionMetadata, as: 'qstnMetaList' },
                    'order',
                    'ASC'
                ],
            ],
            include: [{
                model: Category,
                as: 'catMetaList',
                attributes: [['id', 'categoryId'], 'description', 'order'],
                // Hide through attributes. https://github.com/sequelize/sequelize/issues/6541
                through: { attributes: [] },
                include: [
                    {
                        model: UserPreference,
                        as: 'defaultUserResponse',
                        // TODO: fetch current user
                        //where: { userId: currentUser },
                        attributes: [['value', 'tookPart']]
                    },
                    {
                        model: QuestionMetadata,
                        as: 'qstnMetaList',
                        foreignKey: 'categoryId',
                        attributes: [
                            ['id', 'questionId'],
                            'answerType',
                            'questionPrompt',
                            'order',
                            'options'
                        ],
                        include: [
                            {
                                model: UserPreference,
                                as: 'defaultUserResponse',
                                // TODO: fetch current user
                                //where: { userId: currentUser },
                                attributes: [['value', 'answer']]
                            }
                        ],
                    }
                ],
            }]
        });
    await surveyMetadata?.populateDisplayName();
    return res.status(OK).json(surveyMetadata);
});

router.get('/test/test', async (req: Request, res: Response) => {
    const category : Category[] | null =
        await Category.findAll({ include: { model: Question } });
    return res.status(OK).json({category});
});


/******************************************************************************
 *                                     Export
 ******************************************************************************/

 export default router;
