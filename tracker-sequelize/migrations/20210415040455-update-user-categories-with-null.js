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
     'UserCategories',
     'categoryId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
      ),
     queryInterface.changeColumn(
     'UserCategories',
     'userId',
     {
       type: Sequelize.INTEGER,
       allowNull: false,
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
     'UserCategories',
     'categoryId',
      {
        type: Sequelize.INTEGER,
        allowNull: null,
      }
      ),
     queryInterface.changeColumn(
     'UserCategories',
     'userId',
      {
        type: Sequelize.INTEGER,
        allowNull: null,
      }
     )
    ]);
  }
};
