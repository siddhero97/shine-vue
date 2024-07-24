import { Optional, Model, DataTypes } from "sequelize";
import { sequelize } from "@shared/constants";
import cryptoRandomString from "crypto-random-string";
import { Survey } from ".";

export interface AccessKeyAttributes {
    id: number;
    key: string;
    surveyId: number;
    validAt: Date;
    expiresAt: Date;
}

export const AccessKeyColumns = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    surveyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    validAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
    }
}

type AccessKeyCreationAttributes = Optional<AccessKeyAttributes, "id">;
// interface AccessKeyCreationAttributes
//     extends Optional<AccessKeyAttributes, "id"|"startDate"|"submitDate"> {}

export default class AccessKey extends Model<AccessKeyAttributes, AccessKeyCreationAttributes>
implements AccessKeyAttributes {
    public id!: number;
    public key!: string;
    public surveyId!: number;
    public validAt!: Date;
    public expiresAt!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly survey?: Survey;

    private static addDaysToDate(date : Date, days : number) : Date {
        const res = new Date(date);
        res.setDate(res.getDate() + days);
        return res;
    }

    // Generate (and save) an access key given a survey Id
    public static async generateForSurvey(surveyId : number, expireDays = 21)
        : Promise<[AccessKey, boolean]>
    {
        const date : Date = new Date();
        const expiryDate : Date = this.addDaysToDate(date, expireDays);

        const [access, built] = await AccessKey.findOrBuild({ where: { surveyId: surveyId }});
        access.validAt = date;
        access.expiresAt = expiryDate;
        access.key = cryptoRandomString({length: 10, type: 'alphanumeric'});
        const a = await access.save();
        return [a, built];
    }

    /**
     * Return the absolute url to survey
     * @returns string
     */
    public getUrl() {
        const baseurl = process.env.CLIENT_BASEURL || '';
        return `${baseurl}/accesskey/${this.key}`;
    }
}
AccessKey.init(AccessKeyColumns, {
    modelName: 'AccessKey',
    sequelize
});
