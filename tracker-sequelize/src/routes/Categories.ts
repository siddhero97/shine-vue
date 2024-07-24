/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import Category from '@models/category';
import { paramMissingError, IEntityRequest } from '@shared/constants';
import logger from '@shared/Logger';

const router = Router();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                      Get All Categories - "GET /api/categories
 ******************************************************************************/

router.get('/', async (req: Request, res: Response) => {
    const categories: Category[] = await Category.findAll({
        order: [
            ['order', 'ASC'],
        ],
    });
    return res.status(OK).json({ data: categories });
});



/******************************************************************************
 *                      Get Category by id - "GET /api/categories/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    const categoryId = req.params['id'];
    const category : Category | null = await Category.findByPk(categoryId);
    return res.status(OK).json({ data: category });
});



/******************************************************************************
 *                       Add One - "POST /api/categories"
 ******************************************************************************/

router.post('/', async (req: IEntityRequest, res: Response) => {
    const category = req.body.data;
    if (!category) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    await Category.create(category);
    return res.status(CREATED).end();
});



/******************************************************************************
 *                       Update - "PUT /api/categories"
 *  
 * @TODO Note: category.email must be `null`, unless validation fails
 ******************************************************************************/

router.put('/:id', async (req: IEntityRequest, res: Response) => {
    const category = req.body.data;
    logger.info(`Updating category: ${JSON.stringify(category)}`);
    if (!category) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    category.id = Number(category.id);
    await Category.update(category, { where: { id: category.id }});
    return res.status(OK).end();
});



/******************************************************************************
 *                    Delete - "DELETE /api/categories/:id"
 ******************************************************************************/

router.delete('/:id', async (req: IEntityRequest, res: Response) => {
    const { id } = req.params;
    await Category.destroy({ where: { id: id }});
    return res.status(OK).end();
});



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
