const expressSession = require('../../node_modules/sails/node_modules/express-session');
const sessionStore = require('express-session-sequelize')(expressSession.Store)
const {connections} = require('./index');
let databaseSessionStore= new sessionStore({
    db:connections['default'],
})
let Session = databaseSessionStore.Session
module.exports = {databaseSessionStore,Session,expressSession}