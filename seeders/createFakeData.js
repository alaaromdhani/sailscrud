const bcrypt = require('bcryptjs');
const  {faker}  = require('@faker-js/faker/locale/ar');

async function createFakeData() {
  try {
    if (await User.count() ===0) {
      for (let i = 0; i < 100; i++) {

        const userData = {
          name: faker.name.fullName(),
          email: faker.internet.exampleEmail(),
          password: await bcrypt.hash('admin', 10),
        };

        const newUser = await User.create(userData);
        console.log('New user created:', i);
      }
    }

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error creating seed data:', error);
  }
}

module.exports = createFakeData;
