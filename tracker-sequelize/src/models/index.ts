import { sequelize } from "@shared/constants"
import Category from "./category";
import SurveySection from "./surveysection";
import Question, { QuestionColumns } from "./question";
import SurveyQuestion from "./surveyquestion";
import Survey, { SurveyColumns } from "./survey";
import User from "./user";
import UserPreference from "./userpreference";
import AccessKey from "./accesskey";
import UserNotification from "./usernotifications";

// Custom model definition for SurveyMetadata routes.
export class SurveyMetadata extends Survey {}
SurveyMetadata.init(SurveyColumns, {
    modelName: 'SurveyMetadata',
    tableName: 'Surveys',
    sequelize
});

// Custom model definition for SurveyMetadata routes.
export class QuestionMetadata extends Question {}
QuestionMetadata.init(QuestionColumns, {
    modelName: 'QuestionMetadata',
    tableName: 'Questions',
    sequelize
});

// Custom model definition for SurveySubmission routes.
export class SurveySubmission extends Survey {}
SurveySubmission.init(SurveyColumns, {
    modelName: 'SurveySubmission',
    tableName: 'Surveys',
    sequelize
});

User.hasMany(SurveySubmission, { foreignKey: 'userId' });
SurveySubmission.belongsTo(User, { foreignKey: 'userId' });



User.hasMany(Survey, { foreignKey: 'userId', as: 'surveys' });
Survey.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Survey.belongsToMany(Category, {
    through: { model: SurveySection },
    foreignKey: 'surveyId',
    otherKey: 'categoryId',
});
Category.belongsToMany(Survey, {
    through: { model: SurveySection },
    foreignKey: 'categoryId',
    otherKey: 'surveyId',
});

// All Survey to create SurveySections
Survey.hasMany(SurveySection, {
    foreignKey: 'surveyId',
});

// Custom association name for SurveyMetadata.
SurveyMetadata.belongsToMany(Category, {
    through: { model: SurveySection },
    foreignKey: 'surveyId',
    otherKey: 'categoryId',
    as: 'catMetaList'
});

// Custom association name for SurveySubmission
SurveySubmission.belongsToMany(Category, {
    through: { model: SurveySection },
    foreignKey: 'surveyId',
    otherKey: 'categoryId'
});

SurveySubmission.hasMany(SurveySection, {
    foreignKey: 'surveyId',
    as: 'catSubmissions'
});

SurveySection.belongsTo(Category, {
    foreignKey: 'categoryId'
})

SurveySection.hasMany(SurveyQuestion, {
    foreignKey: 'sectionId',
    as: 'qstnSubmissions'
})

SurveyQuestion.belongsTo(SurveySection, {
    foreignKey: 'sectionId'
})

// foreignKey must be explicitly stated in both directions, otherwise weirdness.
// https://github.com/sequelize/sequelize/issues/5828
Category.hasMany(Question, { foreignKey: 'categoryId' });
Question.belongsTo(Category, { foreignKey: 'categoryId' });

// Custom association name for QuestonMetadata
// TODO: do we really need Questionmetadata?
Category.hasMany(QuestionMetadata, {
    foreignKey: 'categoryId',
    as: 'qstnMetaList'
});
QuestionMetadata.belongsTo(Category, {
    foreignKey: 'categoryId'
});

// Custom association for SurveySubmission route
// TODO: do we really need Questionmetadata?
Category.hasMany(Question, {
    foreignKey: 'categoryId',
    as: 'qstnSubmissions'
});



Question.hasMany(SurveyQuestion, { as: 'userResponse', foreignKey: 'questionId'});
// Question.belongsToMany(Survey, {
//     as: 'userResponse',
//     through: {
//         model: SurveyQuestion,
//         unique: false,
//     },
//     foreignKey: 'questionId',
//     otherKey: 'surveyId'
// });

// Survey.belongsToMany(Question, {
//     through: { SurveyQuestion },
//     foreignKey: 'surveyId',
//     otherKey: 'questionId'
// });

SurveyQuestion.belongsTo(Question, { foreignKey: 'questionId' });

// Both category and question have default values, given in user preferences.
Category.hasMany(UserPreference, {
    foreignKey: 'associatedId',
    constraints: false,
    scope: {
        associatedType: 'category'
    }
});

Question.hasMany(UserPreference, {
    foreignKey: 'associatedId',
    constraints: false,
    scope: {
        associatedType: 'question'
    }
});

// Custom relations for SurveyMetadata route
// Note: additionally these should be scoped by userId
Category.hasOne(UserPreference, {
    as: 'defaultUserResponse',
    foreignKey: 'associatedId',
    constraints: false,
    scope: {
        associatedType: 'category'
    }
});

QuestionMetadata.hasOne(UserPreference, {
    as: 'defaultUserResponse',
    foreignKey: 'associatedId',
    constraints: false,
    scope: {
        associatedType: 'question'
    }
});

// Likewise UserPreference belongs to both Category and Question models.
// https://sequelize.org/master/manual/polymorphic-associations.html
//
UserPreference.belongsTo(Category, { foreignKey: 'associatedId', constraints: false });

UserPreference.belongsTo(Question, { foreignKey: 'associatedId', constraints: false });

// Associate Users and Category Many-to-Many
User.belongsToMany(Category, {
    through: 'UserCategories',
    as: 'categories',
    foreignKey: 'userId',
    otherKey: 'categoryId'
});

//Category.belongsToMany(Survey, { through: SurveySection }); // Not needed yet
Category.belongsToMany(User, {
    through: 'UserCategories',
    as: 'users',
    foreignKey: 'categoryId',
    otherKey: 'userId'
});

// Associate AccessKey to survey.
Survey.hasMany(AccessKey, { as: 'accessKey', foreignKey: 'surveyId' });
AccessKey.belongsTo(Survey, { as: 'survey', foreignKey: 'surveyId'});

// Associate ONE User with MANY UserNotification's
User.hasMany(UserNotification, { as: 'notifications', foreignKey: 'userId' });
UserNotification.belongsTo(User, { as: 'user', foreignKey: 'userId'});

export {
    AccessKey,
    Category,
    Question,
    Survey,
    SurveySection,
    SurveyQuestion,
    User,
    UserNotification,
    UserPreference,
};
