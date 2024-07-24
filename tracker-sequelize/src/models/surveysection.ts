import { sequelize } from "@shared/constants"
import {
    // Optional,
    Model,
    // Association,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    DataTypes
} from "sequelize";
import SurveyQuestion from "./surveyquestion";

export interface SurveySectionAttributes {
    id: number;
    categoryId: number;
    surveyId: number;
    tookPart: boolean;
}

// type SurveySectionCreationAttributes = Optional<SurveySectionAttributes, "id">;
// interface SurveySectionCreationAttributes
//     extends Optional<SurveySectionAttributes, "id"> {}

export default class SurveySection
    extends Model//<SurveySectionAttributes, SurveySectionCreationAttributes>
    implements SurveySectionAttributes
{
    public id!: number;
    public categoryId!: number;
    public surveyId!: number;
    public tookPart!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

  // Since TS cannot determine model association at compile time
  // we have to declare them here purely virtually
  // these will not exist until `Model.init` was called.
  public getSurveyQuestions!: HasManyGetAssociationsMixin<SurveyQuestion>;
  public addSurveyQuestion!: HasManyAddAssociationMixin<SurveyQuestion, number>;
  public hasSurveyQuestion!: HasManyHasAssociationMixin<SurveyQuestion, number>;
  public countSurveyQuestions!: HasManyCountAssociationsMixin;
  public createSurveyQuestion!: HasManyCreateAssociationMixin<SurveyQuestion>;

  // You can also pre-declare possible inclusions, these will only be populated if you
  // actively include a relation.
  // Note this is optional since it's only populated when explicitly requested in code
  public readonly surveyQuestions?: SurveyQuestion[];

    /**
     * Generate the SurveyQuestions for the SurveySection
     * @return SurveySection
     */
    public generateSurveyQuestions() {

        return this;
    }
}
SurveySection.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    surveyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tookPart: {
        type: DataTypes.BOOLEAN,
    },

}, {
    modelName: 'SurveySection',
    indexes: [{
        fields: ['surveyId', 'categoryId'],
        unique: true
    }],
    sequelize
});
