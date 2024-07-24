import { Model, DataTypes } from "sequelize";
import { sequelize } from "@shared/constants";
import { Association,
         BelongsToCreateAssociationMixin,
         BelongsToGetAssociationMixin,
         BelongsToSetAssociationMixin } from "sequelize";
import { Question } from ".";

export interface SurveyQuestionAttributes {
    id: number;
    surveyId: number;
    questionId: number;
    answer: string | number | boolean;
    sectionId: number;
}

// type SurveyQuestionCreationAttributes = Optional<SurveyQuestionAttributes, "id">;
// interface SurveyQuestionCreationAttributes
//     extends Optional<SurveyQuestionAttributes, "id"> {}

export default class SurveyQuestion
    extends Model //<SurveyQuestionAttributes, SurveyQuestionCreationAttributes>
implements SurveyQuestionAttributes {
    public id!: number;
    public surveyId!: number;
    public questionId!: number;
    public answer!: string | number | boolean;
    public sectionId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Assocations for Questions
    public getQuestion!: BelongsToGetAssociationMixin<Question>; // Note the null assertions!
    public setQuestion!: BelongsToSetAssociationMixin<Question, number>;
    public createQuestion!: BelongsToCreateAssociationMixin<Question>;

    // You can also pre-declare possible inclusions, these will only be populated if you
    // actively include a relation.
    // Note this is optional since it's only populated when explicitly requested in code
    public readonly question?: Question;

    public static associations: {
        question: Association<SurveyQuestion, Question>;
    };

}
SurveyQuestion.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    surveyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    answer: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    sectionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

}, {
    modelName: 'SurveyQuestion',
    indexes: [{
        fields: ['surveyId', 'questionId'],
        unique: true
    }],
    sequelize
});
