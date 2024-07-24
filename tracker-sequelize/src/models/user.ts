import { sequelize } from "@shared/constants"
import {
    Model,
    Association,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    DataTypes,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyAddAssociationMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyCreateAssociationMixin,
    BelongsToManyHasAssociationMixin,
    BelongsToManyRemoveAssociationMixin
} from "sequelize";
import { SurveySubmission, UserNotification } from ".";
import Category, { CategoryAttributes } from "./category";
import Survey from "./survey";
import logger from '@shared/Logger';
import EntityAttributes from "@interfaces/EntityAttributes";

import bcrypt from 'bcrypt';
import { phoneNumberToDatabaseFormat } from "@shared/functions";
import { UserNotificationAttributes } from "./usernotifications";

// These are all the attributes in the User model
export interface UserAttributes extends EntityAttributes {
  id: number;
  displayName: string;
  mobilePhone: string;
  email: string;
  categories?: CategoryAttributes[]; //@TODO should be an Optional<UserAttributes, "categories">?
  notifications?: UserNotificationAttributes[];
  password: string;
  confirmPassword: string;
  oldPassword: string;
}

// Some attributes are optional in `User.build` and `User.create` calls
// type UserCreationAttributes = Optional<UserAttributes, "id">;
// interface UserCreationAttributes extends Optional<UserAttributes, "id"> {
//   displayName: string;
// }

// NOTE: As with all the other models, the type specializations
// i.e. <UserAttributes, UserCreationAttributes>
// are commented out to avoid typing issues with Sequelize nested includes.

export default class User extends Model //<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public displayName!: string;
  public mobilePhone!: string;
  public email!: string;
  
  // Password fields
  public password!: string;
  public confirmPassword!: string;
  public oldPassword!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Since TS cannot determine model association at compile time
  // we have to declare them here purely virtually
  // these will not exist until `Model.init` was called.
  public getSurveys!: HasManyGetAssociationsMixin<Survey>; // Note the null assertions!
  public addSurvey!: HasManyAddAssociationMixin<Survey, number>;
  public hasSurvey!: HasManyHasAssociationMixin<Survey, number>;
  public countSurveys!: HasManyCountAssociationsMixin;
  public createSurvey!: HasManyCreateAssociationMixin<Survey>;

  // You can also pre-declare possible inclusions, these will only be populated if you
  // actively include a relation.
  // Note this is optional since it's only populated when explicitly requested in code
  public readonly surveys?: Survey[];

  // Since TS cannot determine model association at compile time
  // we have to declare them here purely virtually
  // these will not exist until `Model.init` was called.
  public getSurveySubmissions!: HasManyGetAssociationsMixin<SurveySubmission>;
  public addSurveySubmission!: HasManyAddAssociationMixin<SurveySubmission, number>;
  public hasSurveySubmission!: HasManyHasAssociationMixin<SurveySubmission, number>;
  public countSurveySubmissions!: HasManyCountAssociationsMixin;
  public createSurveySubmission!: HasManyCreateAssociationMixin<SurveySubmission>;

  // You can also pre-declare possible inclusions, these will only be populated if you
  // actively include a relation.
  // Note this is optional since it's only populated when explicitly requested in code
  public readonly surveySubmissions?: SurveySubmission[];

  // Do the same for Categories
  public getCategories!: BelongsToManyGetAssociationsMixin<Category>; // Note the null assertions!
  public addCategory!: BelongsToManyAddAssociationMixin<Category, number>;
  public removeCategory!: BelongsToManyRemoveAssociationMixin<Category, number>;
  public hasCategory!: BelongsToManyHasAssociationMixin<Category, number>;
  public countCategories!: BelongsToManyCountAssociationsMixin;
  public createCategory!: BelongsToManyCreateAssociationMixin<Category>;

  public readonly categories?: Category[];

  // Do the same for UserNotifications
  public getUserNotifications!: HasManyGetAssociationsMixin<UserNotification>;
  public addUserNotification!: HasManyAddAssociationMixin<UserNotification, number>;
  public hasUserNotification!: HasManyHasAssociationMixin<UserNotification, number>;
  public countUserNotifications!: HasManyCountAssociationsMixin;
  public createUserNotification!: HasManyCreateAssociationMixin<UserNotification>;

  public readonly notifications?: UserNotification[];

  public static associations: {
    surveys: Association<User, Survey>;
    categories: Association<User, Category>;
  };

  /**
   * Generate a survey from a loaded user
   *
   * @returns Survey
   */
  public async generateSurvey() {// Reset all previous surveys

    const newSurvey = await this.createSurveySubmission({
        userId: this.id,
        status: '1',
        surveyDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

    //NOTE: this.categories is not auto-populated by this.getCategories(). 
    const categories = await this.getCategories();
    await newSurvey.generateSurveySections(categories);

    return newSurvey;
  }

  /**
   * Generate a survey from a user id
   *
   * @param userId Id of user to load
   * @returns Survey | null
   */
  static async generateFromId(userId: number) {

    const user = await User.findByPk(userId, {
      include: [{
        model: Category,
        as: 'categories',
      }]
    });

    if (user) {
      return user.generateSurvey();
    }

    return null;
  }
  
  /**
   * Validate the password with a salt
   */
  public validPassword(password: string, passwordHash: string|null = null) {
    if (passwordHash === null) {
      passwordHash = this.password;
    }
    return bcrypt.compareSync(password, passwordHash);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mobilePhone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Must be unique, because used to login users
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  oldPassword: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
  },
  confirmPassword: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'The password must be confirmed',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(passwordVal: string) {
      const salt = bcrypt.genSaltSync(8);
      const passwordHash = bcrypt.hashSync(passwordVal, salt);

      this.setDataValue('password', passwordHash);
    },
  },
}, {
  hooks: {
    beforeSave: (user: User) => {
      try {
        user.mobilePhone = phoneNumberToDatabaseFormat(user.mobilePhone);
      }
      catch (e) {
        logger.err(e);
      }
    },
  },
  validate: {
    checkOldPasswordIsCorrect(this: User) {
      if (!this.changed('password') || this.isNewRecord) return; // Only run if password changed

      // Check if old password has a value
      if (!(this.oldPassword?.length > 0)) {
        throw new Error('You must set the old password if updating the password');
      }

       // Check that the old password is correct
      if (!this.validPassword(this.oldPassword, this.previous('password'))) {
        throw new Error('The old password is not correct');
      }
    },
    checkConfirmPasswordIsCorrect(this: User) {
      if (!this.changed('password')) return; // Only run if password changed

      // Check that the passwords are the same
      if (!this.validPassword(this.confirmPassword, this.password)) {
        throw new Error('The passwords do not match');
      }
    },
  },
  sequelize,
  modelName: 'User',
});
