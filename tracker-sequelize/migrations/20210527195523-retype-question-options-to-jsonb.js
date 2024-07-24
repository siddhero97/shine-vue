'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     */
    await queryInterface.changeColumn('Questions', 'options', {
      type: `${Sequelize.JSONB} USING CAST("options" AS ${Sequelize.JSONB})`
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     */
    await queryInterface.changeColumn('Questions', 'options', {
      type: Sequelize.STRING
    });
  }
};
