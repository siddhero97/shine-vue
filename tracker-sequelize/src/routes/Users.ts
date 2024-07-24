/* eslint-disable @typescript-eslint/no-misused-promises */
import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import { User, Category, UserNotification } from '@models/.';
import { paramMissingError, IEntityRequest } from '@shared/constants';
import logger from '@shared/Logger';
import { Includeable } from 'sequelize/types';
import { UserNotificationAttributes } from '@models/usernotifications';
import { UserAttributes } from '@models/user';

const router = Router();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                      Get All Users - "GET /api/users
 ******************************************************************************/

router.get('/', async (req: Request, res: Response) => {
    
    const queryIncludeModelsString = req.query['includeModels'] as string;
    const includeModels = getUserIncludeModels(queryIncludeModelsString);

    const users: User[] = await User.findAll({
        attributes: { exclude: ['password'] },
        include: includeModels,
        order: [
            ['displayName', 'ASC']
        ],
    });
    return res.status(OK).json({ data: users });
});

const getUserIncludeModels = (queryString: string) => {
    
    const includeModels: Includeable[] = [];

    logger.info(`includeModels = ${queryString}`);
    
    if (queryString) {
        const queryIncludeModels = queryString.split(/, ?/);
        
        if (queryIncludeModels.indexOf('categories') !== -1 ||
            queryIncludeModels.indexOf('category') !== -1) {
            includeModels.push({
                model: Category,
                as: 'categories',
                order: [
                    ['order', 'ASC']
                ],
                // Don't include UserCategories association
                // (May cause trouble when used as the value of UserEditPage)
                through: {
                    attributes: []
                },
            });
        }
        
        if (queryIncludeModels.indexOf('notifications') !== -1) {
            includeModels.push({
                model: UserNotification,
                as: 'notifications',
            });
        }
    }

    return includeModels;
}

/******************************************************************************
 *                      Get User by id - "GET /api/users/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    const userId = req.params['id'];
    
    const queryIncludeModelsString = req.query['includeModels'] as string;
    const includeModels = getUserIncludeModels(queryIncludeModelsString);

    const user: User | null = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: includeModels,
    });

    return res.status(OK).json({ data: user });
});



/******************************************************************************
 *                       Add One - "POST /api/users"
 ******************************************************************************/

router.post('/', async (req: IEntityRequest, res: Response) => {
    const userRequest = req.body.data as UserAttributes;
    if (!userRequest) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    logger.info(`Creating userRequest: ${JSON.stringify(userRequest)}`);

    const user = await User.create(userRequest);

    // Add the relevant categories
    userRequest.categories?.forEach((category) => {
        user.addCategory(category.id);
    });

    // Create notifications
    logger.info(
        `Creating userRequest?.notifications: ${JSON.stringify(userRequest?.notifications)}`);
    if (userRequest?.notifications) {
        await Promise.all(userRequest.notifications.map((notification) => {
            const { id, ...createdNotification } = notification; // Remove id
            notification.userId = user.id;
            
            return UserNotification.create(createdNotification);
        }));
    }

    return res.status(CREATED).end();
});



/******************************************************************************
 *                       Update - "PUT /api/users"
 *  
 * @TODO Note: user.email must be `null`, unless validation fails
 ******************************************************************************/

router.put('/:id', async (req: IEntityRequest, res: Response) => {
    const userRequest = req.body.data as User;

    logger.info(`Updating userRequest: ${JSON.stringify(userRequest)}`);
    if (!userRequest) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    userRequest.id = Number(userRequest.id);

    const user = await User.findByPk(userRequest.id, {
        include: [
            {
                model: Category,
                as: 'categories',
                // Don't include UserCategories association
                through: { 
                    attributes: []
                },
            },
            { // @TODO only include if userRequest.notification is defined?
                model: UserNotification,
                as: 'notifications',
            }
        ],
    });
    
    if (user) {
        // Update list of categories associated with the userRequest
        if (user.categories !== undefined && userRequest.categories !== undefined) {
            const categoriesToAssociate = userRequest.categories.map(({ id }) => id);
            logger.info(`categoriesToAssociate: ${JSON.stringify(categoriesToAssociate)}`);
            user.categories?.forEach((category) => {
                const index = categoriesToAssociate.indexOf(category.id);
                if (index === -1) {
                    // Remove category association by id
                    user.removeCategory(category.id);
                }
                else {
                    // Remove element
                    categoriesToAssociate?.splice(index, 1);
                }
            });

            categoriesToAssociate.forEach((newCategoryId) => {
                user.addCategory(newCategoryId);
            });
        }

        // Update the user notifications
        if (user.notifications !== undefined && userRequest.notifications !== undefined) {
            const notificationDictionary: { [id: string]: UserNotificationAttributes } = {};
            
            for (const notification of userRequest.notifications) {
                notification.userId = user.id; // In case no id (e.g. no notifications beforehand)

                if (notification.id <= 0) { // Negative ID -> create notification
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, updatedAt, createdAt, ...createdNotification } = notification;
                    
                    logger.info(`Created notification: ${JSON.stringify(notification)}`);

                    const notif = await UserNotification.create(createdNotification);
                    
                    logger.info(`Created notification: ${JSON.stringify(notif)}`);
                }
                else { // Place in dictionary for later updating
                    notificationDictionary[notification.id] = notification;
                }
            }
            
             // @TODO make into Promise.all()
            user.notifications?.forEach((notification: UserNotification) => {
                if (!notificationDictionary[notification.id]) {
                    // Delete notification, not in the updated user object
                    notification.destroy();
                    logger.info(`destroyed notification: ${notification.id}`);
                }
                else {
                    // Update notification, it already exists
                    notification.update(notificationDictionary[notification.id]);
                    logger.info(`updated notification: ${notification.id}`);
                }
            });

        }

        // Update the userRequest object (associates are not updated, unlike Model.create())
        await user.update(userRequest);

        return res.status(OK).end();
    }
    else {
        return res.status(BAD_REQUEST).end();
    }

});



/******************************************************************************
 *                    Delete - "DELETE /api/users/:id"
 ******************************************************************************/

router.delete('/:id', async (req: IEntityRequest, res: Response) => {
    const { id } = req.params;
    await User.destroy({ where: { id: id }});
    return res.status(OK).end();
});



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
