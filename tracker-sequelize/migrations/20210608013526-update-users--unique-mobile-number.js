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
     'Users',
     'mobilePhone',
      {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
    
    return queryInterface.removeConstraint('Users', 'mobilePhone_unique_idx')
  }
};