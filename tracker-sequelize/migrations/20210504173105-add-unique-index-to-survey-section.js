'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     */
    await queryInterface.addIndex('SurveySections', {
      fields: ['surveyId', 'categoryId'],
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     */
    await queryInterface.removeIndex('SurveySections', ['surveyId', 'categoryId']);
  }
};
