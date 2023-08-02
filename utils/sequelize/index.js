const Sequelize = require('sequelize')
const databaseCredentials = require('../constants')
const datastores = {
    default: {
        user:databaseCredentials.user,
        password:databaseCredentials.password,
    
        options:{
          
            port:databaseCredentials.options.port,
            dialect:databaseCredentials.options.dialect,
            host:databaseCredentials.options.host,
          
    
    
        },
        database:databaseCredentials.database
   
    
      },
}
const initConnections =() =>{
const connections = {};
let connection, connectionName;

// Try to read settings from old Sails then from the new.
// 0.12: sails.config.connections & sails.config.models.connection
// 1.00: sails.config.datastores & sails.config.models.datastore


for (connectionName in datastores) {
    connection = datastores[connectionName];
        //console.log(connection)
    // Skip waterline and possible non sequelize connections
    if (connection.adapter || !(connection.dialect || connection.options.dialect)) {
        continue;
    }

    if (!connection.options) {
        connection.options = {};
    }

    // If custom log function is specified, use it for SQL logging or use sails logger of defined level
    if (typeof connection.options.logging === 'string' && connection.options.logging !== '') {
        connection.options.logging = sails.log[connection.options.logging];
    }

    if (connection.url) {
        connections[connectionName] = new Sequelize(connection.url, connection.options);
    } else {
        connections[connectionName] = new Sequelize(connection.database,
            connection.user,
            connection.password,
            connection.options);
    }
}
return connections
}
module.exports={
    initConnections,datastores,Sequelize
}