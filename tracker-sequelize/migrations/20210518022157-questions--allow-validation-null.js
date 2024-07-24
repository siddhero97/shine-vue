'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.changeColumn(
     'Questions',
     'validations',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
      );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.changeColumn(
     'Questions',
     'validations',
      {
        type: Sequelize.STRING,
        allowNull: false,
      }
     );
  }
};
