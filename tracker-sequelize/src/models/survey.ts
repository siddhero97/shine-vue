import { sequelize } from "@shared/constants"
import {
    Optional,
    Model,
    // Association,
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
    BelongsToGetAssociationMixin,
    BelongsToCreateAssociationMixin
} from "sequelize";
import User from "./user";
import SurveySection from "./surveysection";
import Category from "./category";
import EntityAttributes from "@interfaces/EntityAttributes";

export interface SurveyAttributes extends EntityAttributes {
    id: number;
    userId: number;
    displayName: string;
    surveyDate: Date;
    status: number;
    startDate: Date;
    submitDate: Date;
}

export const SurveyColumns = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    displayName: {
        type: DataTypes.VIRTUAL
    },
    surveyDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
    },
    submitDate: {
        type: DataTypes.DATE,
    }
}

type SurveyCreationAttributes = Optional<SurveyAttributes, "id"|"startDate"|"submitDate">;
// interface SurveyCreationAttributes
//     extends Optional<SurveyAttributes, "id"|"startDate"|"submitDate"> {}

export default class Survey extends Model//<SurveyAttributes, SurveyCreationAttributes>
    implements SurveyAttributes {
    public id!: number;
    public userId!: number;
    public displayName!: string;
    public surveyDate!: Date;
    public status!: number;
    public startDate!: Date;
    public submitDate!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly user?: User; // associated user

    // Populate virtual attribute displayName.
    public async populateDisplayName(): Promise<string> {
        const user = await User.findByPk(this.getDataValue('userId'));
        this.displayName = user?.displayName || '';
        return Promise.resolve(this.displayName);
    }

    // Do the same for Categories
    public getCategories!: BelongsToManyGetAssociationsMixin<Category>; // Note the null assertions!
    public addCategory!: BelongsToManyAddAssociationMixin<Category, number>;
    public hasCategory!: BelongsToManyHasAssociationMixin<Category, number>;
    public countCategories!: BelongsToManyCountAssociationsMixin;
    public createCategory!: BelongsToManyCreateAssociationMixin<Category>;

    public readonly categories?: Category[];

    //Do the same
    public getSurveySections!: HasManyGetAssociationsMixin<SurveySection>;
    public addSurveySection!: HasManyAddAssociationMixin<SurveySection, number>;
    public hasSurveySection!: HasManyHasAssociationMixin<SurveySection, number>;
    public countSurveySections!: HasManyCountAssociationsMixin;
    public createSurveySection!: HasManyCreateAssociationMixin<SurveySection>;

    // For user
    public getUser!: BelongsToGetAssociationMixin<User>;
    public addUser!: BelongsToCreateAssociationMixin<User>;

    // You can also pre-declare possible inclusions, these will only be populated if you
    // actively include a relation.
    // Note this is optional since it's only populated when explicitly requested in code
    public readonly surveySections?: SurveySection[];

    /**
     * Create the survey sections.
     * It's unnecessary to create the questions for the survey because
     * these can be generated using associations in the response.
     *
     * See src/routes/SurveyMetadata.ts
     * @returns Survey
     */
    public async generateSurveySections(categories?: Category[]) {
        if (!categories || categories.length === 0) {
            categories = await this.getCategories();
        }

        for (const category of categories) { // switch to Promise.all()?
            await this.createSurveySection({
                categoryId: category.id,
                tookPart: false //@TODO check User Preference
            });
        }

        return this;
    }
}
Survey.init(SurveyColumns, {
    modelName: 'Survey',
    sequelize
});
