import { Optional, Model, DataTypes } from "sequelize";
import { sequelize } from "@shared/constants";
import { User } from ".";
import { Notify } from "../Notify";
import EntityAttributes from "@interfaces/EntityAttributes";

export enum TypesOfNotification {
    Text = 'text',
    Email = 'email',
    TextAndEmail = 'textAndEmail',
}

export interface UserNotificationAttributes extends EntityAttributes {
    userId: number;
    daysToSend: string;
    timeToSend: string;
    typeOfNotification: TypesOfNotification;
}

export const UserNotificationColumns = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        validate: {
            min: 1,
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    daysToSend: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[0-6]$/, // @TODO Support multiple days
            // is: /^(?:[0-6],){0,6}[0-6]$/ // Format: 0,1,2,3,4,5,6 (0 is Sunday)
        }
    },
    timeToSend: {
        type: DataTypes.TIME, // Format: HH:MM or HH:MM:SS
        allowNull: false,
    },
    typeOfNotification: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [[
                TypesOfNotification.Text,
                TypesOfNotification.Email,
                TypesOfNotification.TextAndEmail
            ]],
        }
    }

}

type UserNotificationCreationAttributes = Optional<UserNotificationAttributes, "id">;
// interface UserNotificationCreationAttributes
//     extends Optional<UserNotificationAttributes, "id"|"startDate"|"submitDate"> {}

export default class UserNotification
    extends Model<UserNotificationAttributes, UserNotificationCreationAttributes>
    implements UserNotificationAttributes {
    
    public id!: number;
    public userId!: number;
    public daysToSend!: string;
    public timeToSend!: string;
    public typeOfNotification!: TypesOfNotification;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly user?: User;
}
UserNotification.init(UserNotificationColumns, {
    modelName: 'UserNotification',
    hooks: {
        afterSave: async (notification: UserNotification) => {
            const notificationUser = await User.findByPk(notification.userId);
            Notify.updateScheduledJob(notification, notificationUser || undefined);
        }
    },
    sequelize
});
