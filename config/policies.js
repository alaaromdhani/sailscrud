/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  '*':['lang','passport','role','tokenVerifier','permissions'],
  AuthController:{
    '*':['lang','passport','role'],
    logout:['lang','passport','role','tokenVerifier'],
    profileCallback:['lang','passport','role','tokenVerifier'],
    profileUpdater:['lang','passport','role','tokenVerifier','ppUploader'],

  },
  BlogController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','blogfileUploader']
  },
  UploadController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','bulkUpload']
  },
  AssetsController:{
    streamPublicFile:['lang','passport','role'],
    downloadPublicFile:['lang','passport','role'],
    streamPrivateFile:['lang','passport','role','tokenVerifier'],
    downloadPrivateFile:['lang','passport','role','tokenVerifier']

  },
  TestController:{
    upload:['lang','passport','role','bulkUpload'],
    accessCourse:['lang','passport','role']
  },
  CourseController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
  },
  CoursDocumentController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','coursFileUploader'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'commentCourse':['lang','passport','role','tokenVerifier','canCommentCours'],
    
  },
  CoursInteractiveController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','unzip'],
    'accessCourse':['lang','passport','role','tokenVerifier','cours-feature'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'getResults':['lang','passport','role','tokenVerifier'],
    'commentCourse':['lang','passport','role','tokenVerifier','canCommentCours'],
    'clearHistory':['lang','passport','role','tokenVerifier'],
  },
  CoursVideoController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','unzip'],
    'accessCourse':['lang','passport','role','tokenVerifier','cours-feature'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'commentCourse':['lang','passport','role','tokenVerifier','canCommentCours'],
  },
  LrsController:{
    '*':[]
  }



  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};
