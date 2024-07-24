import { CategoryAttributes } from "./CategoryInterfaces";
import { Entity, EntityAttributes } from "./Entity";


// Sequelize validates in tracker-sequelize\src\models\usernotifications.ts
export enum TypesOfNotification {
    Text = 'text',
    Email = 'email',
    TextAndEmail = 'textAndEmail',
}

/** Exact interface from sequelize */
export interface UserNotificationAttributes {
  id: number;
  userId: number;
  daysToSend: string;
  timeToSend: string;
  typeOfNotification: TypesOfNotification;
}

export interface UserAttributes extends EntityAttributes {
  id: number;
  password?: string;
  confirmPassword?: string;
  oldPassword?: string;
  displayName: string;
  mobilePhone: string;
  email?: string;
  categories: CategoryAttributes[];
  notifications: UserNotificationAttributes[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** User - structure for use in the Vue components */

// eslint-disable-next-line @typescript-eslint/no-empty-interface 
export interface User extends Entity<UserAttributes> {}