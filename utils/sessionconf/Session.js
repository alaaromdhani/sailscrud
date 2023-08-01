
const path = require('path');
const Sequelize = require('sequelize')
const expressSession = require('../../node_modules/sails/node_modules/express-session');
const databaseCredentials = require('../../utils/constants');
const sessionStore = require('express-session-sequelize')(expressSession.Store)
const connection = new Sequelize(databaseCredentials.database, databaseCredentials.user, databaseCredentials.password, {
  host: databaseCredentials.options.host,
  dialect: databaseCredentials.options.dialect,

});
let sequelizeSessionStore = new sessionStore({
  db:connection,
 

})
module.exports = sequelizeSessionStore