'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const categoryRows = [
      {id: 1},
      {id: 2},
      {id: 3},
    ];
    
    // Create Categories
    await queryInterface.bulkInsert('Categories', [
      {description: 'Category 1 w/ Order 3', id: categoryRows[0].id, order: 3, createdAt: new Date(), updatedAt: new Date()},
      {description: 'Category 3 w/ Order 2', id: categoryRows[1].id, order: 2, createdAt: new Date(), updatedAt: new Date()},
      {description: 'Category 3 w/ Order 1', id: categoryRows[2].id, order: 1, createdAt: new Date(), updatedAt: new Date()},
    ], {});

    // Create Questions
    // const categories = await queryInterface.sequelize.query(
    //   `SELECT id from Categories;`
    // );

    await queryInterface.bulkInsert('Questions', [
      {questionPrompt: 'Enter Question 1: string', answerType: 'string', id: 1, categoryId: categoryRows[0].id, createdAt: new Date(), updatedAt: new Date()},
      {questionPrompt: 'Enter Question 2: boolean', answerType: 'boolean', id: 2, categoryId: categoryRows[1].id, createdAt: new Date(), updatedAt: new Date()}
    ], {});

    // Hide real user data
    let users = [
      { displayName: 'Test User 1', mobilePhone: '+10011231234', id: '1', password: "$2b$08$XkLRdLvtYINUoZ5mCgfiyuhq8URU4kkwwCglCq0QzrYQs8cxgWiW.", createdAt: new Date(), updatedAt: new Date() },
      { displayName: 'Test User 2', mobilePhone: '+10021231234', email: 'test@example.com', id: '2', password: "$2b$08$XkLRdLvtYINUoZ5mCgfiyuhq8URU4kkwwCglCq0QzrYQs8cxgWiW.", createdAt: new Date(), updatedAt: new Date() },
      { displayName: 'Test User 3', mobilePhone: '+10031231234', id: '3', password: "$2b$08$XkLRdLvtYINUoZ5mCgfiyuhq8URU4kkwwCglCq0QzrYQs8cxgWiW.", createdAt: new Date(), updatedAt: new Date() },
    ];

    try {
      const fs = require('fs');
      const rawdata = fs.readFileSync('./seeders/seed-user.json');
      users = JSON.parse(rawdata);
    } catch(e) {
      // console.error(e);
    }

    await queryInterface.bulkInsert('Users', users, {});

    await queryInterface.bulkInsert('UserNotifications', [
      { id: '1', userId: '1', daysToSend: '1', timeToSend: '23:00', typeOfNotification: 'text', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', userId: '2', daysToSend: '4', timeToSend: '13:30', typeOfNotification: 'text', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', userId: '2', daysToSend: '2', timeToSend: '14:00', typeOfNotification: 'text', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', userId: '3', daysToSend: '4', timeToSend: '22:00', typeOfNotification: 'text', createdAt: new Date(), updatedAt: new Date() },
    ]);
    
    return await queryInterface.bulkInsert('UserCategories', [
      { categoryId: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() },
      { categoryId: 1, userId: 2, createdAt: new Date(), updatedAt: new Date() },
      { categoryId: 1, userId: 3, createdAt: new Date(), updatedAt: new Date() },
      
      { categoryId: 2, userId: 2, createdAt: new Date(), updatedAt: new Date() },
      { categoryId: 2, userId: 3, createdAt: new Date(), updatedAt: new Date() },
      
      { categoryId: 3, userId: 3, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {truncate: true, restartIdentity: true });
    await queryInterface.bulkDelete('Categories', null, {truncate: true, restartIdentity: true });
    return await queryInterface.bulkDelete('Questions', null, {truncate: true, restartIdentity: true });
  }
};
