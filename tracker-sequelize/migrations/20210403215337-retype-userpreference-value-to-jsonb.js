'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('UserPreferences', 'value', {
      type: `${Sequelize.JSONB} USING CAST("value" AS ${Sequelize.JSONB})`
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('UserPreferences', 'value', {
      type: Sequelize.STRING
    });
  }
};
