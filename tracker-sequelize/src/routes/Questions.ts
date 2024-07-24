/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import Question from '@models/question';
import { paramMissingError, IEntityRequest } from '@shared/constants';
import logger from '@shared/Logger';

const router = Router();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                      Get All Questions - "GET /api/questions
 ******************************************************************************/

router.get('/', async (req: Request, res: Response) => {
    const questions : Question[] = await Question.findAll({
        order: [
            ['order', 'ASC']
        ],
    });
    return res.status(OK).json({ data: questions });
});



/******************************************************************************
 *                      Get Question by id - "GET /api/questions/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    const questionId = req.params['id'];
    const question : Question | null = await Question.findByPk(questionId);
    return res.status(OK).json({ data: question });
});



/******************************************************************************
 *                       Add One - "POST /api/questions"
 ******************************************************************************/

router.post('/', async (req: IEntityRequest, res: Response) => {
    const question = req.body.data;
    if (!question) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    logger.info(`Creating question: ${JSON.stringify(question)}`);
    await Question.create(question);
    return res.status(CREATED).end();
});



/******************************************************************************
 *                       Update - "PUT /api/questions"
 ******************************************************************************/

router.put('/:id', async (req: IEntityRequest, res: Response) => {
    const question = req.body.data;
    logger.info(`Updating question: ${JSON.stringify(question)}`);
    if (!question) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    question.id = Number(question.id);
    await Question.update(question, { where: { id: question.id }});
    return res.status(OK).end();
});



/******************************************************************************
 *                    Delete - "DELETE /api/questions/:id"
 ******************************************************************************/

router.delete('/:id', async (req: IEntityRequest, res: Response) => {
    const { id } = req.params;
    await Question.destroy({ where: { id: id }});
    return res.status(OK).end();
});



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
