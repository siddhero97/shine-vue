'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     */
    await queryInterface.addIndex('SurveyQuestions', {
      fields: ['surveyId', 'questionId'],
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     */
    await queryInterface.removeIndex('SurveyQuestions', ['surveyId', 'questionId']);
  }
};
