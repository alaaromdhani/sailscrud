console.log('env loaded');
module.exports = {


  /**** database Connections*****/

  connections: {

    default: {
      user: 'root',
      password: 'password',
      database: 'dbase',
      options: {
        host: 'localhost',
        port: '3306',
        dialect: 'mariadb',
        dialectOptions: {
          useUTC: false, //for reading from database
          dateStrings: true,
          typeCast: true,
        },
        timezone: 'Africa/Tunis', //for writing to database
        pool: {
          max: 5,
          min: 0,
          idle: 10000
        }
      }
    },


  },

  models: {
    migrate: 'alter',
    timezone: 'Africa/Tunis',
    // cascadeOnDestroy: false,

  },

  blueprints: {
    prefix: '/api',
    restPrefix: '/v1',
    pluralize: true,
  },

  security: {

    cors: {
      // allowOrigins: [
      //   'https://example.com',
      // ]
    },

  },

  session: {

    // adapter: '@sailshq/connect-redis',
    // url: 'redis://user:password@localhost:6379/databasenumber',
    //--------------------------------------------------------------------------
    // /\   OR, to avoid checking it in to version control, you might opt to
    // ||   set sensitive credentials like this using an environment variable.
    //
    // For example:
    // ```
    // sails_session__url=redis://admin:myc00lpAssw2D@bigsquid.redistogo.com:9562/0
    // ```
    //
    //--------------------------------------------------------------------------

    // name: '__Host-sails.sid',

    cookie: {
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    },

  },

  sockets: {

    // onlyAllowOrigins: [
    //   'https://example.com',
    //   'https://staging.example.com',
    // ],


    // adapter: '@sailshq/socket.io-redis',
    // url: 'redis://user:password@bigsquid.redistogo.com:9562/databasenumber',
    //--------------------------------------------------------------------------
    // /\   OR, to avoid checking it in to version control, you might opt to
    // ||   set sensitive credentials like this using an environment variable.
    //
    // For example:
    // ```
    // sails_sockets__url=redis://admin:myc00lpAssw2D@bigsquid.redistogo.com:9562/0
    // ```
    //--------------------------------------------------------------------------

  },


  log: {
    level: 'debug'
  },


  http: {


    cache: 365.25 * 24 * 60 * 60 * 1000, // One year

    // trustProxy: true,

  },


  // port: 80,
  // ssl: undefined,

  custom: {
    baseUrl: 'https://example.com',
    internalEmailAddress: 'support@example.com',

    // sendgridSecret: 'SG.fake.3e0Bn0qSQVnwb1E4qNPz9JZP5vLZYqjh7sn8S93oSHU',
    // stripeSecret: 'sk_prod__fake_Nfgh82401348jaDa3lkZ0d9Hm',
    //--------------------------------------------------------------------------
    // /\   OR, to avoid checking them in to version control, you might opt to
    // ||   set sensitive credentials like these using environment variables.
    //
    // For example:
    // ```
    // sendgridSecret=SG.fake.3e0Bn0qSQVnwb1E4qNPz9JZP5vLZYqjh7sn8S93oSHU
    // sails_custom__stripeSecret=sk_prod__fake_Nfgh82401348jaDa3lkZ0d9Hm
    // ```
    //--------------------------------------------------------------------------

  },

};
