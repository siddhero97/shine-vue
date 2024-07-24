import {
    Optional,
    Model,
    DataTypes,
    Association,
    BelongsToManyAddAssociationMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyCreateAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyHasAssociationMixin,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin
} from "sequelize";
import { sequelize } from "@shared/constants"
import { Question, User } from ".";
import EntityAttributes from "@interfaces/EntityAttributes";

export interface CategoryAttributes extends EntityAttributes {
    id: number;
    description: string;
    order: number;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, "id">;
// interface CategoryCreationAttributes
//     extends Optional<CategoryAttributes, "id"> {}

export default class Category extends Model//<CategoryAttributes, CategoryCreationAttributes>
implements CategoryAttributes {
public id!: number;
public description!: string;
public order!: number;

public readonly createdAt!: Date;
public readonly updatedAt!: Date;

  // Since TS cannot determine model association at compile time
  // we have to declare them here purely virtually
  // these will not exist until `Model.init` was called.
  public getUsers!: BelongsToManyGetAssociationsMixin<User>; // Note the null assertions!
  public addUser!: BelongsToManyAddAssociationMixin<User, number>;
  public hasUser!: BelongsToManyHasAssociationMixin<User, number>;
  public countUsers!: BelongsToManyCountAssociationsMixin;
  public createUser!: BelongsToManyCreateAssociationMixin<User>; 

  public readonly Users?: User[];

  // Assocations for Questions
  public getQuestions!: HasManyGetAssociationsMixin<Question>; // Note the null assertions!
  public addQuestion!: HasManyAddAssociationMixin<Question, number>;
  public hasQuestion!: HasManyHasAssociationMixin<Question, number>;
  public countQuestions!: HasManyCountAssociationsMixin;
  public createQuestion!: HasManyCreateAssociationMixin<Question>;

  // You can also pre-declare possible inclusions, these will only be populated if you
  // actively include a relation.
  // Note this is optional since it's only populated when explicitly requested in code
  public readonly questions?: Question[];

  public static associations: {
    users: Association<Category, User>;
    questions: Association<Category, Question>;
  };

    // public async generateSection(survey: Survey) {
    // }
}
Category.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    modelName: 'Category',
    sequelize
});
