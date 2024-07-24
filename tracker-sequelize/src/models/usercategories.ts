import { sequelize } from "@shared/constants"
import {
    Optional,
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
    BelongsToManyHasAssociationMixin
} from "sequelize";
// import { Category } from ".";
// import Survey from "./survey";

// These are all the attributes in the User model
export interface UserCategoriesAttributes {
  id: number;
  categoryId: number;
  userId: number;
}

// Some attributes are optional in `User.build` and `User.create` calls
type UserCategoriesCreationAttributes = Optional<UserCategoriesAttributes, "id">
// interface UserCreationAttributes extends Optional<UserCategoriesAttributes, "id"> {
//   displayName: string;
// }

export default class UserCategories
  extends Model<UserCategoriesAttributes, UserCategoriesCreationAttributes>
  implements UserCategoriesAttributes {
  public id!: number;
  public categoryId!: number;
  public userId!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
  };
}

UserCategories.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'UserCategories',
});