'use strict';

const Logger = require('jet-logger').default;
const logger = new Logger();

const { collapseTextChangeRangesAcrossMultipleVersions } = require("typescript");

/**
 * Seed data arrays, so we know how many elements to delete when we remove the data.
 */
const now = new Date();

// Add baseId.type to your id; makes the seed data more robust if
// other seed data is used.
const baseId = {
  user: 3,
  survey: 0,
  accessKey: 0,
  category: 3,
  question: 2,
  userPreference: 0,
  surveySection: 0,
  surveyQuestion: 0,
};

const userData = [
  { id: baseId.user + 1, displayName: 'Bailey', password: "$2b$08$XkLRdLvtYINUoZ5mCgfiyuhq8URU4kkwwCglCq0QzrYQs8cxgWiW.", mobilePhone: '+1555-5555554', email: 'bailey@example.com', createdAt: now, updatedAt: now },
  { id: baseId.user + 2, displayName: 'Tom', password: "$2b$08$XkLRdLvtYINUoZ5mCgfiyuhq8URU4kkwwCglCq0QzrYQs8cxgWiW.", mobilePhone: '+1555-5555555', email: 'tom@example.com', createdAt: now, updatedAt: now },
  { id: baseId.user + 3, displayName: 'Amanda M.', password: "$2b$08$XkLRdLvtYINUoZ5mCgfiyuhq8URU4kkwwCglCq0QzrYQs8cxgWiW.", mobilePhone: '+1555-5555556', email: 'amanda.m@example.com', createdAt: now, updatedAt: now },
];

const surveyData = [
  { id: 1, userId: baseId.user + 1, surveyDate: '2021-04-01 00:00:00+00', startDate: null, submitDate: null, status: 1, createdAt: now, updatedAt: now },
  { id: 2, userId: baseId.user + 2, surveyDate: '2021-04-02 00:00:00+00', startDate: null, submitDate: null, status: 1, createdAt: now, updatedAt: now },
  { id: 3, userId: baseId.user + 3, surveyDate: '2021-04-05 00:00:00+00', startDate: null, submitDate: null, status: 1, createdAt: now, updatedAt: now },
];

const accessKeyData = [
  { id: 1, key: 'abc123', surveyId: 3, validAt: '2021-04-01 00:00:00+00', expiresAt: '2027-04-01 00:00:00+00', createdAt: now, updatedAt: now },
];

const categoryData = [
  { id: baseId.category + 1, order: 5, description: 'Mobile Outreach', createdAt: now, updatedAt: now },
  { id: baseId.category + 2, order: 3, description: 'Lunch', createdAt: now, updatedAt: now },
  { id: baseId.category + 3, order: 2, description: 'Art Activity', createdAt: now, updatedAt: now },
  { id: baseId.category + 4, order: 1, description: 'Outdoor Sports', createdAt: now, updatedAt: now },
  { id: baseId.category + 5, order: 0, description: 'One-on-One Mentoring', createdAt: now, updatedAt: now },
  { id: baseId.category + 6, order: 4, description: 'Mobile Meals (East Van)', createdAt: now, updatedAt: now },
  { id: baseId.category + 7, order: 6, description: 'Drop-in Center (Abbotsford)', createdAt: now, updatedAt: now },
  { id: baseId.category + 8, order: 7, description: 'Drop-in Center (Mission)', createdAt: now, updatedAt: now },
  { id: baseId.category + 9, order: 8, description: 'Art Workshop (East Van)', createdAt: now, updatedAt: now },
  { id: baseId.category + 10, order: 9, description: 'Tutoring', createdAt: now, updatedAt: now },
];

const questionData = [
  { id: baseId.question + 1, categoryId: baseId.category + 1, order: 1, answerType: 'number', questionPrompt: 'How many people attended?', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 2, categoryId: baseId.category + 1, order: 1, answerType: 'boolean', questionPrompt: 'Did you share the Gospel?', createdAt: now, updatedAt: now },
  { id: baseId.question + 3, categoryId: baseId.category + 1, order: 1, answerType: 'boolean', questionPrompt: 'Did you feed the cat?', createdAt: now, updatedAt: now },
  { id: baseId.question + 4, categoryId: baseId.category + 5, order: 1, answerType: 'number', questionPrompt: 'Number of youth mentored', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 5, categoryId: baseId.category + 5, order: 1, answerType: 'number', questionPrompt: 'Total mentoring hours', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 6, categoryId: baseId.category + 6, order: 2, answerType: 'number', questionPrompt: 'Number of youth served', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 7, categoryId: baseId.category + 6, order: 2, answerType: 'number', questionPrompt: 'Total meals served', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 8, categoryId: baseId.category + 6, order: 2, answerType: 'boolean', questionPrompt: 'Received donated food', createdAt: now, updatedAt: now },
  { id: baseId.question + 9, categoryId: baseId.category + 7, order: 1, answerType: 'number', questionPrompt: 'Number of youth who attended', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 10, categoryId: baseId.category + 7, order: 1, answerType: 'number', questionPrompt: 'Number of hours open', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 11, categoryId: baseId.category + 8, order: 1, answerType: 'number', questionPrompt: 'Number of youth who attended', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 12, categoryId: baseId.category + 8, order: 1, answerType: 'number', questionPrompt: 'Number of hours open', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 13, categoryId: baseId.category + 9, order: 2, answerType: 'number', questionPrompt: 'Number of youth who attended', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 14, categoryId: baseId.category + 9, order: 3, answerType: 'number', questionPrompt: 'Number of hours open', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 15, categoryId: baseId.category + 6, order: 1, answerType: 'select', questionPrompt: 'Meal type',
    options: JSON.stringify([[10, "Breakfast"],[20, "Lunch"],[30, "Dinner"],[40, "Snack"]]), createdAt: now, updatedAt: now },
  { id: baseId.question + 16, categoryId: baseId.category + 10, order: 1, answerType: 'multiselect', questionPrompt: 'Tutoring topics',
    options: JSON.stringify([[10, "Math/Science"], [20, "Music/Art"], [30, "Languages"], [40, "History"], [50, "Life skills"], [60, "Other"]]), createdAt: now, updatedAt: now },
  { id: baseId.question + 17, categoryId: baseId.category + 10, order: 1, answerType: 'number', questionPrompt: 'Total tutoring hours', validations: 'non-negative int', createdAt: now, updatedAt: now },
  { id: baseId.question + 18, categoryId: baseId.category + 9, order: 1, answerType: 'shorttext', questionPrompt: 'Activity', validations: 'required', createdAt: now, updatedAt: now },
  ];

const userPreferenceData = [
  { id: 1, userId: baseId.user + 1, associatedId: baseId.question + 1, associatedType: 'question', value: JSON.stringify(10), createdAt: now, updatedAt: now },
  { id: 2, userId: baseId.user + 1, associatedId: baseId.category + 1, associatedType: 'category', value: JSON.stringify(true), createdAt: now, updatedAt: now },
  { id: 3, userId: baseId.user + 1, associatedId: baseId.category + 2, associatedType: 'category', value: JSON.stringify(true), createdAt: now, updatedAt: now },
  { id: 4, userId: baseId.user + 1, associatedId: baseId.category + 3, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 5, userId: baseId.user + 1, associatedId: baseId.question + 3, associatedType: 'question', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 6, userId: baseId.user + 1, associatedId: baseId.question + 2, associatedType: 'question', value: JSON.stringify(true), createdAt: now, updatedAt: now },
  { id: 7, userId: baseId.user + 3, associatedId: baseId.category + 1, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 8, userId: baseId.user + 3, associatedId: baseId.category + 2, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 9, userId: baseId.user + 3, associatedId: baseId.category + 3, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 10, userId: baseId.user + 3, associatedId: baseId.category + 5, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 11, userId: baseId.user + 3, associatedId: baseId.category + 6, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 12, userId: baseId.user + 3, associatedId: baseId.category + 7, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 13, userId: baseId.user + 3, associatedId: baseId.category + 8, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 14, userId: baseId.user + 3, associatedId: baseId.category + 9, associatedType: 'category', value: JSON.stringify(false), createdAt: now, updatedAt: now },
  { id: 15, userId: baseId.user + 3, associatedId: baseId.question + 4, associatedType: 'question', value: JSON.stringify(2), createdAt: now, updatedAt: now },
  { id: 16, userId: baseId.user + 3, associatedId: baseId.question + 5, associatedType: 'question', value: JSON.stringify(3), createdAt: now, updatedAt: now },
  { id: 17, userId: baseId.user + 3, associatedId: baseId.question + 6, associatedType: 'question', value: JSON.stringify(0), createdAt: now, updatedAt: now },
  { id: 18, userId: baseId.user + 3, associatedId: baseId.question + 7, associatedType: 'question', value: JSON.stringify(1), createdAt: now, updatedAt: now },
  { id: 19, userId: baseId.user + 3, associatedId: baseId.question + 8, associatedType: 'question', value: JSON.stringify(true), createdAt: now, updatedAt: now },
  { id: 20, userId: baseId.user + 3, associatedId: baseId.question + 9, associatedType: 'question', value: JSON.stringify(0), createdAt: now, updatedAt: now },
  { id: 21, userId: baseId.user + 3, associatedId: baseId.question + 10, associatedType: 'question', value: JSON.stringify(0), createdAt: now, updatedAt: now },
  { id: 22, userId: baseId.user + 3, associatedId: baseId.question + 11, associatedType: 'question', value: JSON.stringify(0), createdAt: now, updatedAt: now },
  { id: 23, userId: baseId.user + 3, associatedId: baseId.question + 12, associatedType: 'question', value: JSON.stringify(0), createdAt: now, updatedAt: now },
  { id: 24, userId: baseId.user + 3, associatedId: baseId.question + 13, associatedType: 'question', value: JSON.stringify(0), createdAt: now, updatedAt: now },
  { id: 25, userId: baseId.user + 3, associatedId: baseId.question + 14, associatedType: 'question', value: JSON.stringify(2), createdAt: now, updatedAt: now },
  { id: 26, userId: baseId.user + 3, associatedId: baseId.question + 15, associatedType: 'question', value: JSON.stringify(20), createdAt: now, updatedAt: now },
  { id: 27, userId: baseId.user + 3, associatedId: baseId.question + 16, associatedType: 'question', value: JSON.stringify([]), createdAt: now, updatedAt: now },
  { id: 28, userId: baseId.user + 3, associatedId: baseId.question + 17, associatedType: 'question', value: JSON.stringify(1), createdAt: now, updatedAt: now },
  { id: 29, userId: baseId.user + 3, associatedId: baseId.question + 18, associatedType: 'question', value: JSON.stringify("Open workshop"), createdAt: now, updatedAt: now },
];

const surveySectionData = [
  { id: 1, categoryId: baseId.category + 1, surveyId: 1, tookPart: true, createdAt: now, updatedAt: now },
  { id: 2, categoryId: baseId.category + 2, surveyId: 1, tookPart: false, createdAt: now, updatedAt: now },
  { id: 3, categoryId: baseId.category + 3, surveyId: 1, tookPart: false, createdAt: now, updatedAt: now },
  { id: 4, categoryId: baseId.category + 5, surveyId: 3, tookPart: false, createdAt: now, updatedAt: now },
  { id: 5, categoryId: baseId.category + 6, surveyId: 3, tookPart: false, createdAt: now, updatedAt: now },
  { id: 6, categoryId: baseId.category + 7, surveyId: 3, tookPart: false, createdAt: now, updatedAt: now },
  { id: 7, categoryId: baseId.category + 8, surveyId: 3, tookPart: false, createdAt: now, updatedAt: now },
  { id: 8, categoryId: baseId.category + 9, surveyId: 3, tookPart: true, createdAt: now, updatedAt: now },
  { id: 9, categoryId: baseId.category + 10, surveyId: 3, tookPart: false, createdAt: now, updatedAt: now },
];

const surveyQuestionData = [
  { id: 1, surveyId: 1, questionId: baseId.question + 1, answer: JSON.stringify(21), sectionId: 1, createdAt: now, updatedAt: now },
];


/**
 * Reset the next ID in the sequence if rows have been added with explicit IDs.
 * If this is not done, a "Validation Error" may occur when a record is created with an existing ID.
 * TODO: what id should the real data start on? e.g. 1000?
 */
function resetSequence(table, column, queryInterface) {
  const resetSql = `SELECT setval(pg_get_serial_sequence('"${table}"', '${column}'), coalesce(max(${column}),0) + 1, false) FROM "${table}";`;
  // logger.info(resetSql);
  return queryInterface.sequelize.query(resetSql);
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     */

    try {
      logger.info('Seed Users');
      await queryInterface.bulkInsert('Users', userData);
      await resetSequence('Users', 'id', queryInterface);

      logger.info('Seed Surveys');
      await queryInterface.bulkInsert('Surveys', surveyData);
      await resetSequence('Surveys', 'id', queryInterface);

      logger.info('Seed AccessKeys');
      await queryInterface.bulkInsert('AccessKeys', accessKeyData);
      await resetSequence('AccessKeys', 'id', queryInterface);

      logger.info('Seed Categories');
      await queryInterface.bulkInsert('Categories', categoryData);
      await resetSequence('Categories', 'id', queryInterface);

      logger.info('Seed Questions');
      await queryInterface.bulkInsert('Questions', questionData);
      await resetSequence('Questions', 'id', queryInterface);

      logger.info('Seed UserPreferences');
      await queryInterface.bulkInsert('UserPreferences', userPreferenceData);
      await resetSequence('UserPreferences', 'id', queryInterface);

      logger.info('Seed SurveySections');
      await queryInterface.bulkInsert('SurveySections', surveySectionData);
      await resetSequence('SurveySections', 'id', queryInterface);

      logger.info('Seed SurveyQuestions');
      await queryInterface.bulkInsert('SurveyQuestions', surveyQuestionData);
      await resetSequence('SurveyQuestions', 'id', queryInterface);
    } catch(e) {
      logger.err(e);
      console.log(e); // console.log has better error formatting.
      throw e;
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const {lte, gt, and} = Sequelize.Op;

    async function bulkDeleteArray(queryInterface, table, base, count) {
      try {
        logger.info(table);
        return await queryInterface.bulkDelete(table, { [and]: [
          {id: {[gt]: base}},
          {id: {[lte]: base + count}}
        ]}, {});
      } catch(e) {
        console.log(e);
        throw e;
      }
    }

    // Delete only the rows we added.
    // Note: this uses Sequelize WHERE clause syntax.
    // https://sequelize.org/master/manual/model-querying-basics.html

    await bulkDeleteArray(queryInterface, 'Users', baseId.user, userData.length);
    await bulkDeleteArray(queryInterface, 'Surveys', baseId.survey, surveyData.length);
    await bulkDeleteArray(queryInterface, 'AccessKeys', baseId.accessKey, accessKeyData.length);
    await bulkDeleteArray(queryInterface, 'Categories', baseId.category, categoryData.length);
    await bulkDeleteArray(queryInterface, 'Questions', baseId.question, questionData.length);
    await bulkDeleteArray(queryInterface, 'UserPreferences', baseId.userPreference, userPreferenceData.length);
    await bulkDeleteArray(queryInterface, 'SurveySections', baseId.surveySection, surveySectionData.length);
    await bulkDeleteArray(queryInterface, 'SurveyQuestions', baseId.surveyQuestion, surveyQuestionData.length);
  }
};
