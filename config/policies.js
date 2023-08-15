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
  '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
  AuthController:{
    '*':['lang','passport','role'],//shared
    forgetPassword:['lang','passport','role','noauth'],//normaluseronly
    validateCode:['lang','passport','role','noauth'],//normaluseronly
    logout:['lang','passport','role','auth'],//shared
    profileCallback:['lang','passport','role','auth','adminonly'],//adminonly
    activateAccount:['lang','passport','role','inactiveonly'],//normaluseronly
    resendCallback:['lang','passport','role','auth','normalUserOnly'],//normaluseronly
    profileUpdater:['lang','passport','role','auth','adminonly','ppUploader'],//shared

  },
  
  BlogController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','blogfileUploader']//adminonly
  },
  ModuleController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'find':['lang','passport','role','tokenVerifier','adminonly']//adminonly
  },
  ChapitreController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'find':['lang','passport','role','tokenVerifier','adminonly']//adminonly
  },
  UploadController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','bulkUpload']//adminonly
  },
  AssetsController:{
    streamPublicFile:['lang','passport','role'],//shared
    downloadPublicFile:['lang','passport','role'],//shared
    streamPrivateFile:['lang','passport','role','tokenVerifier'],//shared
    downloadPrivateFile:['lang','passport','role','tokenVerifier']//shared

  },
  TestController:{
    upload:['lang','passport','role','bulkUpload'],//adminonly
    '*':['lang','passport','role']//adminonly
  },
  UserController:{
    update:['lang','passport','role','tokenVerifier','adminonly','permissions','ppUploader'],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
  },
  CourseController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'treeView':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'findOneCourse':['lang','passport','role','tokenVerifier','adminonly','canseecourse'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
  },
  CoursDocumentController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','coursFileUploader'],//adminonly
    'validateCours':['lang','passport','role','tokenVerifier','adminonly','validation'],//adminonly
    'rateCourse':['lang','passport','role','tokenVerifier','adminonly',],//adminonly
    'commentCourse':['lang','passport','role','tokenVerifier','adminonly','canCommentCours'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    
  },
  CoursInteractiveController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','unzip'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'validateCours':['lang','passport','role','tokenVerifier','adminonly','validation'],//adminonly
    'accessCourse':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'rateCourse':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'getResults':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'commentCourse':['lang','passport','role','tokenVerifier','adminonly','canCommentCours'],//adminonly
    'clearHistory':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
  },
  CoursVideoController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'validateCours':['lang','passport','role','tokenVerifier','adminonly','validation'],//adminonly
    
    'rateCourse':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'commentCourse':['lang','passport','role','tokenVerifier','adminonly','canCommentCours'],//adminonly
  },
  SoftSkillsDocumentController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','skDocument'],//adminonly
    'rateSoftSkill':['lang','passport','role','tokenVerifier','adminonly']//adminonly
    
  },
  SoftSkillsVideoController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'rateSoftSkill':['lang','passport','role','tokenVerifier','adminonly']//adminonly
  },
  LrsController:{
    '*':['lang','passport','role','tokenVerifier']//shared
  },
  OtherLrsController:{
    '*':['lang','passport','role','tokenVerifier'],//shared
  },
  SoftSkillsController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],//adminonly
    'update':['lang','passport','role','tokenVerifier','permissions'],//adminonly
    'findAllChildren':['lang','passport','role','tokenVerifier','childrenPermissions'],//adminonly
  },
  SoftSkillsInteractiveController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','unzipsoftskill'],//adminonly
    'accessSoftSkills':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'rateSoftSkill':['lang','passport','role','tokenVerifier','adminonly',]//adminonly
    
  },
  PrepaidCardController:{
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
  
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
  },
  PackController:{
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
  },
  MatiereController:{
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','matiereImageUploader'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions','matiereImageUploader'],//adminonly
    'find':['lang','passport','role','adminonly','tokenVerifier'],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },
  NiveauScolaireController:{
    'find':['lang','passport','role','tokenVerifier','adminonly',],//adminonly
    'findOne':['lang','passport','role','tokenVerifier','adminonly',],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },
  TrimestreController:{
    'find':['lang','passport','role','tokenVerifier','adminonly',],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },
  ChapitreController:{
    'find':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },

  CTypeController:{
    'create':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    'update':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    '*':['lang','passport','role','tokenVerifier','permissions']//adminonly
   
  },
  OtherDocumentController:{
    'create':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    'update':['lang','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    'rateCourse':['lang','passport','role','tokenVerifier'],//adminonly
    '*':['lang','passport','role','tokenVerifier','permissions']//adminonly
   },
   OtherCourseController:{
    findChildren:['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
   },
   OtherInteractiveController:{
    'create':['lang','passport','role','tokenVerifier','adminonly','permissions','unzipOther'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'rateCourse':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'accessCourse':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    'getResults':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions']//adminonly
   },
   OtherVideoController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    
    'rateCourse':['lang','passport','role','tokenVerifier','adminonly'],//adminonly
   },
   //normal user
   HomeController:{
    'updateProfile':['lang','passport','role','auth','normalUserOnly','ppUploadernormalUser'],//normaluseronly
    'updatePhoneNumber':['lang','passport','role','auth','normalUserOnly'],//normaluseronly
    'profileCallback':['lang','passport','role','auth','normalUserOnly']
   },
   StudentController:{
    'create':['lang','passport','role','tokenVerifier','parent','ppUploader'],//normaluseronly
    'find':['lang','passport','role','tokenVerifier','parent'],//normaluseronly
    'getschoolLevels':['lang','passport','role','tokenVerifier'],//normaluseronly
    'updateStudent':['lang','passport','role','tokenVerifier','parent','ppUploader'],//normaluseronly,
    'findOneStudent':['lang','passport','role','tokenVerifier','parent'],
    'schoolYearsHistory':['lang','passport','role','tokenVerifier','parent']
    


  },
  StudentHomeController:{
    '*':['lang','passport','role','tokenVerifier','student']
  },
  ParentHomeController:{
    '*':['lang','passport','role','tokenVerifier','parent']
  }



  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};
