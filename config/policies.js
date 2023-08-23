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
  '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
  AuthController:{
    '*':['lang','passport','role'],//shared
    forgetPassword:['lang','passport','role','noauth'],//normaluseronly
    validateCode:['lang','passport','role','noauth'],//normaluseronly
    logout:['lang','passport','role','auth'],//shared
    profileCallback:['lang','dashboardPassport','passport','role','auth','adminonly'],//adminonly
    activateAccount:['lang','passport','role','inactiveonly'],//normaluseronly
    resendCallback:['lang','passport','role','auth','normalUserOnly'],//normaluseronly
    profileUpdater:['lang','dashboardPassport','passport','role','auth','adminonly','ppUploader'],//shared

  },
  
  BlogController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','blogfileUploader']//adminonly
  },
  ModuleController:{
    '*':['lang','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'find':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly']//adminonly
  },
  ChapitreController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'find':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly']//adminonly
  },
  UploadController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','bulkUpload']//adminonly
  },
  AssetsController:{
    streamPublicFile:['lang','passport','role'],//shared
    downloadPublicFile:['lang','passport','role'],//shared
    streamPrivateFile:['lang','passport','role','tokenVerifier'],//shared
    downloadPrivateFile:['lang','passport','role','tokenVerifier']//shared

  },
  TestController:{
    upload:['lang','dashboardPassport','passport','tokenVerifier','role','bulkUpload'],//adminonly
    '*':['lang','dashboardPassport','passport','tokenVerifier','role']//adminonly
  },
  UserController:{
    update:['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','ppUploader'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
  },
  CourseController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'treeView':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'findOneCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','canseecourse'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
  },
  CoursDocumentController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','coursFileUploader'],//adminonly
    'validateCours':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','validation'],//adminonly
    'rateCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly',],//adminonly
    'commentCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','canCommentCours'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    
  },
  CoursInteractiveController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','unzip'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'validateCours':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','validation'],//adminonly
    'accessCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'rateCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'getResults':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'commentCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','canCommentCours'],//adminonly
    'clearHistory':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
  },
  CoursVideoController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'validateCours':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','validation'],//adminonly
    
    'rateCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'commentCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','canCommentCours'],//adminonly
  },
  SoftSkillsDocumentController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','skDocument'],//adminonly
    'rateSoftSkill':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly']//adminonly
    
  },
  SoftSkillsVideoController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'rateSoftSkill':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly']//adminonly
  },
  LrsController:{
    '*':['lang','passport','role','tokenVerifier']//shared
  },
  OtherLrsController:{
    '*':['lang','passport','role','tokenVerifier'],//shared
  },
  SoftSkillsController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','permissions'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','permissions'],//adminonly
    'findAllChildren':['lang','dashboardPassport','passport','role','tokenVerifier','childrenPermissions'],//adminonly
  },
  SoftSkillsInteractiveController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','unzipsoftskill'],//adminonly
    'accessSoftSkills':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'rateSoftSkill':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly',]//adminonly
    
  },
  PrepaidCardController:{
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
  
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
  },
  PackController:{
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','packPhotoUploader'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
  },
  MatiereController:{
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','matiereImageUploader'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','matiereImageUploader'],//adminonly
    'find':['lang','dashboardPassport','passport','role','adminonly','tokenVerifier'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },
  NiveauScolaireController:{
    'find':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly',],//adminonly
    'findOne':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly',],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },
  TrimestreController:{
    'find':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly',],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },
  ChapitreController:{
    'find':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
    
  },

  CTypeController:{
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','permissions']//adminonly
   
  },
  OtherDocumentController:{
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','permissions','CTypeFileUploader'],//adminonly
    'rateCourse':['lang','dashboardPassport','passport','role','tokenVerifier'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','permissions']//adminonly
   },
   OtherCourseController:{
    examView:['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],
    findChildren:['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
   },
   OtherInteractiveController:{
    'create':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions','unzipOther'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'rateCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'accessCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    'getResults':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions']//adminonly
   },
   OtherVideoController:{
    '*':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    'update':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly','permissions'],//adminonly
    
    'rateCourse':['lang','dashboardPassport','passport','role','tokenVerifier','adminonly'],//adminonly
   },
   //normal user
   HomeController:{
    'updateProfile':['lang','passport','role','auth','normalUserOnly','ppUploadernormalUser'],//normaluseronly
    'updatePhoneNumber':['lang','passport','role','auth','normalUserOnly'],//normaluseronly
    'profileCallback':['lang','passport','role','auth','teacher-parent'],
    'getMatiereByNiveau':['lang','passport','role','auth','normalUserOnly']
   },
   StudentController:{
    'create':['lang','parentPassport','passport','role','tokenVerifier','parent','ppUploader'],//normaluseronly
    'find':['lang','parentPassport','passport','role','tokenVerifier','parent'],//normaluseronly
    'getschoolLevels':['lang','passport','role','tokenVerifier'],//normaluseronly
    'updateStudent':['lang','parentPassport','passport','role','tokenVerifier','parent','ppUploader'],//normaluseronly,
    'findOneStudent':['lang','parentPassport','passport','role','tokenVerifier','parent'],
    'schoolYearsHistory':['lang','parentPassport','passport','role','tokenVerifier','parent'],
    '*':['lang','parentPassport','passport','role','tokenVerifier','parent']
    


  },
  StudentHomeController:{
    '*':['lang','studentPassport','passport','role','tokenVerifier','student']
  },
  ParentHomeController:{
    '*':['lang','parentPassport','passport','role','tokenVerifier','parent']
  }



  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};
