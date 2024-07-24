'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     */
    await queryInterface.changeColumn('SurveyQuestions', 'answer', {
      type: `${Sequelize.JSONB} USING CAST("answer" AS ${Sequelize.JSONB})`
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     */
     await queryInterface.changeColumn('SurveyQuestions', 'answer', {
      type: Sequelize.STRING
    });
  }
};
