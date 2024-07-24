'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserPreferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      associatedId: {
        type: Sequelize.INTEGER
      },
      associatedType: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('UserPreferences', {
      unique: true,
      fields: ['userId', 'associatedId', 'associatedType']
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserPreferences');
  }
};