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
  'post /auth/:provider/:action': 'AuthController.callback',
  'get /logout': 'AuthController.logout',
  'post /forgetpass':'AuthController.forgetPassword',
  'get /validate/:user_id/:code':'AuthController.validateResetPasswordLink',
  'post /resetpass/:user_id/:code':'AuthController.resetPassword',
  'get /profile/me':'AuthController.profileCallback',
  'patch /profile/me':'AuthController.profileUpdater',
  'get /register/countries':'AuthController.getCounteries',
  'get /register/states/:countryId':'AuthController.getStatesByCountry',
  'get /v/uploads/:filename':'AssetsController.streamPrivateFile',
  'get /v/public/:filename':'AssetsController.streamPublicFile',
  'get /d/uploads/:filename':'AssetsController.downloadPrivateFile',
  'get /d/public/:filename':'AssetsController.downloadPublicFile',
  'post /api/v1/rate_interactive_course/:id':'CoursInteractiveController.rateCourse',
  'post /api/v1/rate_document_course/:id':'CoursDocumentController.rateCourse',
  'post /api/v1/rate_video_course/:id':'CoursVideoController.rateCourse',
  'GET /api/v1/find_children/:id':'CourseController.findOneCourse',
  'get /cours/:id':'CoursInteractiveController.accessCourse',
  'GET /lrs/activities/state':'LrsController.getActivityState',
  'PUT /lrs/activities/state':'LrsController.putState',
  'PUT /lrs/statements':'LrsController.putStatement',
  'GET /api/v1/results/:id':'CoursInteractiveController.getResults',
  'POST /api/v1/comment_interactive_cours/:id':'CoursInteractiveController.commentCourse',
  'POST /api/v1/comment_video_cours/:id':'CoursVideoController.commentCourse',
  'POST /api/v1/comment_document_cours/:id':'CoursDocumentController.commentCourse',
  'DELETE /api/v1/attemp/:id':'CoursInteractiveController.clearHistory',
  'GET /api/v1/softskills/children/:id':'SoftSkillsController.findAllChildren',
  'GET /softskills/:id':'SoftSkillsInteractiveController.accessSoftSkills',
  'POST /api/v1/softskillsinteractives/rate/:id':'SoftSkillsInteractiveController.rateSoftSkill',
  'POST /api/v1/softskillsdocuments/rate/:id':'SoftSkillsDocumentController.rateSoftSkill',
  'POST /api/v1/softskillsvideos/rate/:id':'SoftSkillsVideosController.rateSoftSkill',
  'GET /api/v1/courses_tree':'CourseController.treeView',
  //rating
  'POST /api/v1/rateotherdocuments/:id':'OtherDocumentController.rateCourse',
  'POST /api/v1/rateothervideos/:id':'OtherVideoController.rateCourse',
  'POST /api/v1/rateotherinteractive/:id':'OtherInteractiveController.rateCourse',
  'get /othercourses/:id':'OtherInteractiveController.accessCourse',
  'GET /api/v1/otherresults/:id':'OtherInteractiveController.getResults',
  'GET /lrs/other/activities/state':'OtherLrsController.getActivityState',
  'GET /api/v1/other_courses_children/:id':'OtherCourseController.findChildren',
  'PATCH /api/v1/coursdocuments/validate/:id':'CoursDocumentController.validateCours',
  'PATCH /api/v1/coursinteractives/validate/:id':'CoursInteractiveController.validateCours',
  'PATCH /api/v1/coursvideos/validate/:id':'CoursDocumentController.validateCours',
 
  'PUT /lrs/other/activities/state':'OtherLrsController.putState',
  'PUT /lrs/other/statements':'OtherLrsController.putStatement',
 
  


  
  





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
