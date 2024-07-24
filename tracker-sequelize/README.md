# tracker-sequelize

## Seed Information

### Passwords

The default password for seeded users is "test123" using:

```
require('bcrypt').hashSync('test123', '$2b$08$XkLRdLvtYINUoZ5mCgfiyu');
'$2b$08$XkLRdLvtYINUoZ5mCgfiyuhq8URU4kkwwCglCq0QzrYQs8cxgWiW.'
```

To generate more general passwords:

```
var b=require('bcrypt'); b.hashSync('YOUR_PASSWORD', b.genSaltSync(8));
```

### Seed with sensitive user information

You can include a `tracker-sequelize/seeders/seed-user.json` file with a JSON array containing the information of 3 users.

See `const rawdata = fs.readFileSync('./seeders/seed-user.json');` in `tracker-sequelize/seeders/20210328024855-demo-user.js`.

## Configuration

Copy `src/pre-start/env/[your-environment].example.env` to `src/pre-start/env/[your-environment].env` and edit to reflect your current setup.

## Running

TODO: Write information about building and deploying

In development mode:

```sh
npm run start:dev
```

To update dependencies

```sh
npm install
```

For production:

```sh
npm run build
npm start
```

## Background

We use https://github.com/seanpmaxwell/express-generator-typescript to generate the project, then add sequelize to it.

Sequelize is not written in typescript, and the generators create JavaScript files. Therefore we'll create the models and migrations in JavaScript, then translate the models to Typescript.

## Sequelize configuration

Sequelize by default uses `config/config.json` for database configuration, however for our project we use a js file `config/config.js` by modifying the .sequelizerc file, which Sequelize reads on startup.

In order for standalone Sequelize and the rest of the project to use the same configuration, we read the env files from `src/pre-start/env/` for configuration. The env files are dotenv compatible and contain comments and simple key=value pairs only.

## Notes for Models

#### TypeScript vs Sequelize model attributes issue on all models

Because the Model Attributes are not used to specialize the Model class, they are commented out to avoid a warning.
If Sequelize fixes the typing issue then we'll uncomment both the type and the model specialization for models.
