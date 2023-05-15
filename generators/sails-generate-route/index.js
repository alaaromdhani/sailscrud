const path = require('path');
const _ = require('lodash');
const replace = require('replace');
require('colors');
const fs = require('fs')
/**
 * @description Generates route entries for the given schema name.
 * @docs https://sailsjs.com/docs/concepts/extending-sails/generators/custom-generators
 *
 * Usage:
 * This handler should be added to your .sailsrc file for registering
 * a custom sails generator.
 * The shell command to be executed will be:
 * `sails generate <generator-name> <schema-name>`,
 * where:
 *   a) `generator-name` is a name used for generator in .sailsrc file
 *   b) `schema-name` is a name of schema to be added
 */
module.exports = {
  /**
   * `before()` is run before executing any of the `targets`
   * defined below.
   *
   * This is where we can validate user input, configure default
   * scope variables, get extra dependencies, and so on.
   *
   * @param  {Dictionary} scope
   * @param  {Function} done
   */
  before(scope, done) {
    if (_.isUndefined(scope.args[0])) {
      return done('Please provide a name for this controller.'.yellow);
    }

    const name = scope.args[0];
    const route = _.snakeCase(name);
    const file = _.startCase(scope.args[0]).replace(/ /g, '');
    const routesFile = path.resolve(__dirname, '../../config/routes.js')
    var routesFileContenu = ''
    const newRoutes =`
      /**  Endpoints for ${_.startCase(name)}  **/

      'GET /${route}': '${file}Controller.find',
      'GET /${route}/:id': '${file}Controller.findOne',
      'POST /${route}': '${file}Controller.create',
      'PATCH /${route}/:id': '${file}Controller.update',
      'DELETE /${route}/:id': '${file}Controller.destroy',


    /******* END ALL ROUTES *******/
    ` ;

    /****** Reading File routers ******/


    // try{
    //  const data = fs.readFileSync(routesFile);
    //  routesFileContenu =  data.toString()
    // } catch (err) {
    // console.error(err);
    // }

    // routesFileContenu = routesFileContenu.replace('/******* END ALL ROUTES *******/',newRoutes);

    // try {
    // fs.writeFileSync(routesFile, routesFileContenu);
    //  console.log("File has been saved.");
    // } catch (error) {
    // console.error(err);
    // }



    const newPolicies=` ${file}Controller: {
    '*': ['isAuthorized'],
     },`








    replace({
      regex: '// ////.+',
      replacement: `// //// DO NOT TOUCH THIS LINE
  ${file}Controller: {
    '*': ['isAuthorized'],
  },`,

      paths: [path.resolve(__dirname, '../../config/policies.js')],
      recursive: false,
      silent: false,
    });

    return done();
  },

  targets: {},

  /**
   * The absolute path to the `templates` for this generator
   * (for use with the `template` and `copy` builtins)
   *
   * @type {String}
   */
};
