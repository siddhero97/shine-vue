'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([queryInterface.changeColumn(
     'Users',
     'mobile_phone',
      {
        type: Sequelize.STRING,
        allowNull: false,
      }
      ),
     queryInterface.changeColumn(
     'Users',
     'email',
      {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true
        }
      }
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
    
    return Promise.all([queryInterface.changeColumn(
     'Users',
     'mobile_phone',
      {
        type: Sequelize.STRING,
        allowNull: null,
      }
      ),
     queryInterface.changeColumn(
     'Users',
     'email',
      {
        type: Sequelize.STRING,
        allowNull: null,
        validate: null
      }
     )
    ]);
  }
};
