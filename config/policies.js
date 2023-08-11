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
    forgetPassword:['lang','passport','role','noauth'],
    validateCode:['lang','passport','role','noauth'],
    logout:['lang','passport','role','auth'],
    profileCallback:['lang','passport','role','auth'],
    activateAccount:['lang','passport','role','inactiveonly'],
    resendCallback:['lang','passport','role','auth'],
    profileUpdater:['lang','passport','role','auth','ppUploader'],

  },
  
  BlogController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','blogfileUploader']
  },
  ModuleController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'find':['lang','passport','role','tokenVerifier']
  },
  ChapitreController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'find':['lang','passport','role','tokenVerifier']
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
  UserController:{
    update:['lang','passport','role','tokenVerifier','permissions','ppUploader'],
    '*':['lang','passport','role','tokenVerifier','permissions'],
  },
  CourseController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'treeView':['lang','passport','role','tokenVerifier'],
    'findOneCourse':['lang','passport','role','tokenVerifier','canseecourse'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
  },
  CoursDocumentController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','coursFileUploader'],
    'validateCours':['lang','passport','role','tokenVerifier','validation'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'commentCourse':['lang','passport','role','tokenVerifier','canCommentCours'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    
  },
  CoursInteractiveController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','unzip'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'validateCours':['lang','passport','role','tokenVerifier','validation'],
    'accessCourse':['lang','passport','role','tokenVerifier'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'getResults':['lang','passport','role','tokenVerifier'],
    'commentCourse':['lang','passport','role','tokenVerifier','canCommentCours'],
    'clearHistory':['lang','passport','role','tokenVerifier'],
  },
  CoursVideoController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'validateCours':['lang','passport','role','tokenVerifier','validation'],
    
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'commentCourse':['lang','passport','role','tokenVerifier','canCommentCours'],
  },
  SoftSkillsDocumentController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','skDocument'],
    'rateSoftSkill':['lang','passport','role','tokenVerifier']
    
  },
  SoftSkillsVideoController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'rateSoftSkill':['lang','passport','role','tokenVerifier']
  },
  LrsController:{
    '*':['lang','passport','role','tokenVerifier']
  },
  OtherLrsController:{
    '*':['lang','passport','role','tokenVerifier'],
  },
  SoftSkillsController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'findAllChildren':['lang','passport','role','tokenVerifier','childrenPermissions'],
  },
  SoftSkillsInteractiveController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','unzipsoftskill'],
    'accessSoftSkills':['lang','passport','role','tokenVerifier'],
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
    'find':['lang','passport','role','tokenVerifier'],
    '*':['lang','passport','role','tokenVerifier','permissions']
    
  },
  NiveauScolaireController:{
    'find':['lang','passport','role','tokenVerifier'],
    'findOne':['lang','passport','role','tokenVerifier'],
    '*':['lang','passport','role','tokenVerifier','permissions']
    
  },
  TrimestreController:{
    'find':['lang','passport','role','tokenVerifier'],
    '*':['lang','passport','role','tokenVerifier','permissions']
    
  },
  ChapitreController:{
    'find':['lang','passport','role','tokenVerifier'],
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
   OtherCourseController:{
    findChildren:['lang','passport','role','tokenVerifier'],
    '*':['lang','passport','role','tokenVerifier','permissions']
   },
   OtherInteractiveController:{
    'create':['lang','passport','role','tokenVerifier','permissions','unzipOther'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    'rateCourse':['lang','passport','role','tokenVerifier'],
    'accessCourse':['lang','passport','role','tokenVerifier'],
    'getResults':['lang','passport','role','tokenVerifier'],
    '*':['lang','passport','role','tokenVerifier','permissions']
   },
   OtherVideoController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'update':['lang','passport','role','tokenVerifier','permissions'],
    
    'rateCourse':['lang','passport','role','tokenVerifier'],
   },
   //normal user
   HomeController:{
    'updateProfile':['lang','passport','role','auth','ppUploadernormalUser'],
    'updatePhoneNumber':['lang','passport','role','auth'],
   },
   StudentController:{
    'create':['lang','passport','role','tokenVerifier','parent','ppUploader'],
    'find':['lang','passport','role','tokenVerifier','parent'],
    'getschoolLevels':['lang','passport','role','tokenVerifier']
  },



  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};
