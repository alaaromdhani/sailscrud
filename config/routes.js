/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */


module.exports.routes = {
  'post /auth/local': 'AuthController.callback',
  'post /auth/local/:action': 'AuthController.callback',
  'get /logout': 'AuthController.logout',
  'post /forgetpass':'AuthController.forgetPassword',
  'get /validate/:user_id/:code':'AuthController.validateResetPasswordLink',
  'post /resetpass/:user_id/:code':'AuthController.resetPassword',
  'get /profile/me':'AuthController.profileCallback',
  'patch /profile/me':'AuthController.profileUpdater',
  'get /register/countries':'AuthController.getCounteries',
  'get /register/states/:countryId':'AuthController.getStatesByCountry',
  'get /v/uploads/:filename':'AssetsController.streamPrivateFile',
  'get /v/public/:filename':'AssetsController.streamPublicFile'



  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

 


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
