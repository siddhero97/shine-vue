import { sequelize } from "@shared/constants"
import {
    // Optional,
    Model,
    DataTypes
} from "sequelize";

// Helper function
const uppercaseFirst = (str : string) : string => {
  return `${str[0].toUpperCase()}${str.substr(1)}`
};

// These are all the attributes in the UserPreference model
export interface UserPreferenceAttributes {
  id: number;
  userId: number;
  associatedId: number;
  associatedType: string;
  value: string | number | boolean; // Restrict to simple types for now.
}

// Some attributes are optional in `UserPreference.build` and `UserPreference.create` calls
//type UserPreferenceCreationAttributes = Optional<UserPreferenceAttributes, "id">

export default class UserPreference
  extends Model //<UserPreferenceAttributes, UserPreferenceCreationAttributes>
  implements UserPreferenceAttributes {
  public id!: number;
  public userId!: number;
  public associatedId!: number;
  public associatedType!: string;
  public value!: string | number | boolean;

    // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    //surveys: Association<UserPreference, Survey>;
  };

  // This is a TypeScript hack. The original JS code is from
  // the Sequelize polymorphic associations page (find 'getCommentable'):
  // https://sequelize.org/master/manual/polymorphic-associations.html
  //
  getAssociated(options : any) : Promise<any> {
    if (!this.associatedType) return Promise.resolve(null);
    const mixinMethodName = `get${uppercaseFirst(this.associatedType)}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return (this as any)[mixinMethodName](options) as Promise<any>;
  }
}

UserPreference.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  associatedId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  associatedType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.JSONB,
  }
}, {
  sequelize,
  modelName: 'UserPreference',
});

// Specific hook for user preferences on category and question.
// This may have to be run after associations are created.
// TODO: better TypeScript
UserPreference.addHook("afterFind", (findResult : any) => {
  if (!Array.isArray(findResult)) findResult = [findResult];
  for (const instance of findResult) {
    if (instance.associatedType === "question" && instance.question !== undefined) {
      instance.associated = instance.question;
    } else if (instance.associatedType === "category" && instance.category !== undefined) {
      instance.associated = instance.category;
    }
    // To prevent mistakes:
    delete instance.question;
    delete instance.dataValues.question;
    delete instance.category;
    delete instance.dataValues.category;
  }
});