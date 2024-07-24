'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([queryInterface.addColumn(
     'Users',
     'mobile_phone',
      Sequelize.STRING
      ),
     queryInterface.addColumn(
     'Users',
     'email',
     Sequelize.STRING
     )
     ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn('Users', 'mobile_phone'),
      queryInterface.removeColumn('Users', 'email')
    ]);
  }
};
