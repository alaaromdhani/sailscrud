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
    '*':['lang','passport','role']
  },
  CourseController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'treeView':['lang','passport','role','tokenVerifier'],
    'findOneCourse':['lang','passport','role','tokenVerifier','canseecourse']
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
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'commentCourse':['lang','passport','role','tokenVerifier','canCommentCours'],
  },
  SoftSkillsDocumentController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','skDocument'],
    'rateSoftSkill':['lang','passport','role','tokenVerifier']
    
  },
  SoftSkillsVideoController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'rateSoftSkill':['lang','passport','role','tokenVerifier']
  },
  LrsController:{
    '*':['lang','passport','role','tokenVerifier']
  },
  SoftSkillsController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'findAllChildren':['lang','passport','role','tokenVerifier','childrenPermissions'],
  },
  SoftSkillsInteractiveController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','unzipsoftskill'],
    'accessSoftSkills':['lang','passport','role','tokenVerifier','cours-feature'],
    'rateSoftSkill':['lang','passport','role','tokenVerifier']
    
  },
  PrepaidCardController:{
    'create':['lang','passport','role','tokenVerifier','permissions','packPhotoUploader'],
    'update':['lang','passport','role','tokenVerifier','permissions','packPhotoUploader'],
  
    '*':['lang','passport','role','tokenVerifier','permissions']
  },
  PackController:{
    'create':['lang','passport','role','tokenVerifier','permissions','packPhotoUploader'],
    'update':['lang','passport','role','tokenVerifier','permissions','packPhotoUploader'],
    '*':['lang','passport','role','tokenVerifier','permissions']
  },
  MatiereController:{
    'create':['lang','passport','role','tokenVerifier','permissions','matiereImageUploader'],
    'update':['lang','passport','role','tokenVerifier','permissions','matiereImageUploader'],
    '*':['lang','passport','role','tokenVerifier','permissions']
    
  },
  CTypeController:{
    'create':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],
    'update':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],
    '*':['lang','passport','role','tokenVerifier','permissions']
   
  },
  OtherDocumentController:{
    'create':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],
    'update':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    '*':['lang','passport','role','tokenVerifier','permissions']
   },
   OtherInteractiveController:{
    'create':['lang','passport','role','tokenVerifier','permissions','unzipOther'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    '*':['lang','passport','role','tokenVerifier','permissions']
   }



  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};
