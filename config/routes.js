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
  
  'get /validate/:user_id/:code':'AuthController.validateResetPasswordLink',
  'get /profile/me':'AuthController.profileCallback',
  'patch /profile/me':'AuthController.profileUpdater',
  'get /register/countries':'AuthController.getCounteries',
  'get /register/states/:countryId':'AuthController.getStatesByCountry',
    //dashboardpayment
  'get /api/v1/series/:seller_id':'PrepaidCardController.getPrepaidCardsBySeller',
  'get /api/v1/prepaidcards/print/:id':'PrepaidCardController.print',
  //medialibrary
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
  'GET /lrs/student/activities/state':'LrsStudentController.getActivityState',
  'PUT /lrs/student/activities/state':'LrsStudentController.putState',
  'PUT /lrs/student/statements':'LrsStudentController.putStatement',
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
  'GET /api/v1/exam_tree':'CourseController.examView',
  //rating
  'POST /api/v1/rateotherdocuments/:id':'OtherDocumentController.rateCourse',
  'POST /api/v1/rateothervideos/:id':'OtherVideoController.rateCourse',
  'POST /api/v1/rateotherinteractive/:id':'OtherInteractiveController.rateCourse',
  'get /othercourses/:id':'OtherInteractiveController.accessCourse',
  'GET /api/v1/otherresults/:id':'OtherInteractiveController.getResults',
  'GET /lrs/other/activities/state':'OtherLrsController.getActivityState',
  'GET /api/v1/other_courses_children/:id':'OtherCourseController.findChildren',
  //validation
  'PATCH /api/v1/coursdocuments/validate/:id':'CoursDocumentController.validateCours',
  'PATCH /api/v1/coursinteractives/validate/:id':'CoursInteractiveController.validateCours',
  'PATCH /api/v1/coursvideos/validate/:id':'CoursVideo.validateCours',
 
  'PUT /lrs/other/activities/state':'OtherLrsController.putState',
  'PUT /lrs/other/statements':'OtherLrsController.putStatement',
   //stats_back
   'GET /api/v1/stats':'StatsController.count',

  //front_routes 
  'POST /front/api/v1/activate_account': 'AuthController.activateAccount',
  'GET /front/api/v1/resend/:type': 'AuthController.resendCallback',
  //forgetpassword
  'POST /front/api/v1/forgetpassword': 'AuthController.forgetPassword',
  'POST /front/api/v1/forgetpassword/verify': 'AuthController.validateCode',
  //parent space
  //pursuase
  'GET /front/api/v1/purchase/trimestres/:student_id/:annee_scolaire_id':'ParentHomeController.getPaybleTrimestres',
  'post /front/api/v1/trimestres/choose':'ParentHomeController.canAddFourthTrimestre',
  //cart
  'GET /front/parent/api/v1/cart':'ParentHomeController.readCart',
  'POST /front/parent/api/v1/cart':'ParentHomeController.addToCart',
 
  'delete /front/parent/api/v1/cart/:id':'ParentHomeController.deleteFromCart',
    
  //orders

  'POST /front/api/v1/parent/orders':'ParentHomeController.addOrder',
  'GET /front/api/v1/parent/matieres/:id':'ParentHomeController.getMatieresWithStudentProgress',
  'GET /front/api/v1/parent/courses/:MatiereId/:id':'ParentHomeController.getCourses',
  'GET /front/api/v1/parent/courses/children/:courseId/:id':'ParentHomeController.getChildren',
  'GET /front/api/v1/parent/courses/results/:courseId/:id':'ParentHomeController.getResults',
  'GET /front/api/v1/parent/exams/:MatiereId/:id':'ParentHomeController.getExams',
  'GET /front/api/v1/parent/exams/children/:id/:courseId':'ParentHomeController.getExamsChildren',
  'GET /front/api/v1/parent/ctypes/:id':'ParentHomeController.getCtypes',
  'GET /front/api/v1/parent/ctypes/:id/:cTypeId':'ParentHomeController.getOtherCourse',
  'GET /front/api/v1/parent/ctypes/children/:id/:other_id':'ParentHomeController.getOtherChildren',
    
  'POST /front/api/v1/parent/pay/:id/:type':'ParentHomeController.payOrder',
  'GET /front/api/v1/verify-payement':'ParentHomeController.verifyPayement',
  
  'GET /front/api/v1/parent/orders/:id':'ParentHomeController.getOrder',
  'GET /front/api/v1/parent/orders/type/:type':'ParentHomeController.getOrders',

   'GET /front/api/v1/parent/orders/:user_id/:annee_scolaire_id':'ParentHomeController.getOrderByStudentAnnee', 
  'delete /front/api/v1/parent/orders/:id':'ParentHomeController.deleteOrder',
  'POST /front/api/v1/parent/orders/coupon/:id':'ParentHomeController.applicateCoupon',
    
  //livraisons front:
   'POST /front/api/v1/adresses':      'ParentHomeController.createAdresse',
   'GET /front/api/v1/adresses':       'ParentHomeController.getAdresses',
   'delete /front/api/v1/adresses/:id':'ParentHomeController.deleteAdresse',
   'POST /front/api/v1/livraisons':     'ParentHomeController.createLivraisons',
   'GET /front/api/v1/livraisons':     'ParentHomeController.getLivraisons',
  
   
 
  //student management
 
  'POST /front/api/v1/students': 'StudentController.create',
  'PATCH /front/api/v1/students/schoollevels/:id': 'StudentController.addSchoolLevel',
  'GET /front/api/v1/students/schoollevels/:id': 'StudentController.getStudentSchoolLevels',
  'GET /front/api/v1/students/trimestres': 'ParentHomeController.getTrimestres',
  
  'PATCH /front/api/v1/students/:id': 'StudentController.updateStudent',
  'GET /front/api/v1/students': 'StudentController.find',
  'DELETE /front/api/v1/students/:id': 'StudentController.destroy',
  'GET /front/api/v1/schoollevels': 'StudentController.getschoolLevels',
  'GET /front/api/v1/students/:id': 'StudentController.findOneStudent',
  //schoolYearsHistory
  'GET /front/api/v1/students/years-history/:id': 'StudentController.schoolYearsHistory',
  //coaching videos
  'GET /front/parent/api/v1/themes': 'ParentHomeController.getThemes',
  'GET /front/parent/api/v1/coachingvideos': 'ParentHomeController.getCoachingVideos',
  'GET /front/parent/api/v1/coachingvideos/access': 'ParentHomeController.canAccessCoachingVideos',
  
  //normal user profile 
  'GET /front/api/v1/profile':'HomeController.profileCallback',
  'GET /front/api/v1/country':'HomeController.getMyCountry',
  'GET /front/tp/api/v1/profile':'HomeController.profileTpCallback',
 
  'PATCH /front/api/v1/profile':'HomeController.updateProfile',
  'PATCH /front/api/v1/profile/phonenumber':'HomeController.updatePhoneNumber',
  //student endpoints,
  'GET /front/student/api/v1/matieres':'StudentHomeController.getMatieres',
  'GET /front/student/api/v1/courses/:MatiereId/:TrimestreId':'StudentHomeController.getCourses',
  'GET /front/student/api/v1/courses/children/:courseId/:TrimestreId':'StudentHomeController.getChildren',
  'GET /front/student/api/v1/profile':'StudentHomeController.profileCallback',
  'GET /front/student/api/v1/purchases':'StudentHomeController.availableTrimestres',
  'GET /front/student/api/v1/interactive/:courseId':'StudentHomeController.accessCourse',
  'GET /front/student/api/v1/interactive/info/:type/:courseId':'StudentHomeController.getInfoCourse',
  'GET /front/student/api/v1/interactive/:type/:courseId/':'StudentHomeController.accessCourse',
  
  'GET /front/student/api/v1/canAccessSoftSkills':'StudentHomeController.canAccessSoftSckills', 
  'GET /front/student/api/v1/softkills/themes':'StudentHomeController.getsoftSkillsThemes', 
  'GET /front/student/api/v1/softkills/parent/:theme_id':'StudentHomeController.getSoftSkills', 
  'GET /front/student/api/v1/softkills/children/:id':'StudentHomeController.getsoftSkillsChildren', 
  
  'GET /front/student/api/v1/softskills/interactive/:id':'StudentHomeController.accessSoftSkills', 
  'GET /front/student/api/v1/exams/:TrimestreId/:MatiereId':'StudentHomeController.getExams', 
  'GET /front/student/api/v1/exams/children/:TrimestreId/:courseId':'StudentHomeController.getExamsChildren', 
  'GET /front/student/api/v1/ctypes':'StudentHomeController.getCtypes', 
  'GET /front/student/api/v1/ctypes/:cTypeId':'StudentHomeController.getCtypesChildren', 
  'GET /front/student/api/v1/ctypes/others/children/:other_id':'StudentHomeController.getOthersChildren', 
  'GET /front/student/api/v1/ctypes/others/interactive/:id':'StudentHomeController.accessOthersCourse', 
  
  //config
  'GET /front/api/v1/matieres/:NiveauScolaireId':'HomeController.getMatiereByNiveau',
  //sharedEndpoints
  'GET /front/student/api/v1/trimestres':'HomeController.getTrimestres',
  
  //teacher-routes
  'POST /front/teacher/api/v1/classrooms':'TeacherHomeController.createClassroom',
  'GET /front/teacher/api/v1/classrooms':'TeacherHomeController.getAllClassRooms',
  'GET /front/teacher/api/v1/niveauscolaires':'TeacherHomeController.getAvailableSchoolLevels',
  'GET /front/teacher/api/v1/classrooms/trimestres/:id':'TeacherHomeController.getTrimestres',
  'GET /front/teacher/api/v1/classrooms/trimestres/:id':'TeacherHomeController.getTrimestres',
  'GET /front/teacher/api/v1/purchase/trimestres/:classroom_id':'TeacherHomeController.getPayableTrimestre',
  'post /front/teacher/api/v1/trimestres/choose':'TeacherHomeController.canAddFourthTrimestre',
  'post /front/teacher/api/v1/cart':'TeacherHomeController.addToCart',
  'GET /front/teacher/api/v1/cart':'TeacherHomeController.readCart',
  'DELETE /front/teacher/api/v1/cart/:id':'TeacherHomeController.removeFromCart',
  'POST /front/teacher/api/v1/orders':'TeacherHomeController.createOrder',
  'GET /front/teacher/api/v1/orders/:id':'TeacherHomeController.getOrder',
  'GET /front/teacher/api/v1/orders/type/:type':'TeacherHomeController.findAllOrders',
  'POST /front/api/v1/teacher/orders/coupon/:id':'TeacherHomeController.applicateCoupon',
  'delete /front/api/v1/teacher/orders/:id':'TeacherHomeController.deleteOrder',
 
  'POST /front/teacher/api/v1/adresses':      'TeacherHomeController.createAdresse',
  'GET /front/teacher/api/v1/adresses':      'TeacherHomeController.getAdresses',
  
  'delete /front/teacher/api/v1/adresses/:id':'TeacherHomeController.deleteAdresse',
  'post /front/teacher/api/v1/livraisons':'TeacherHomeController.createLivraison',
  'POST /front/api/v1/teacher/pay/:id/:type':'TeacherHomeController.payOrder',
  'GET /front/teacher/api/v1/matieres/:id':'TeacherHomeController.getMatieres',
  'GET /front/api/v1/teacher/courses/:MatiereId/:id':'TeacherHomeController.getCourses',
 
  'GET /front/api/v1/teacher/courses/children/:courseId/:id':'TeacherHomeController.getCoursesChildren',
  'GET /front/teacher/api/v1/interactive/:id/:courseId':'TeacherHomeController.accessCourse',
  'GET /front/teacher/api/v1/results/:courseId':'TeacherHomeController.getResults',
  'delete /front/teacher/api/v1/results/:courseId':'TeacherHomeController.clearHistory',
 
  //exams teacher
  'GET /front/api/v1/teacher/exams/:MatiereId/:id':'TeacherHomeController.getExams',
  'GET /front/api/v1/teacher/exams/children/:id/:courseId':'TeacherHomeController.getExamsChildren',
  'GET /front/api/v1/teacher/exams/interactive/:id/:courseId':'TeacherHomeController.accessExams',
  //score 
  'GET /front/stats/api/v1/score':'HomeController.getTopStudent',
  'GET /front/public/api/v1/packs':'HomeController.getPacks',
  
  'GET /front/student/api/v1/score':'StudentHomeController.getCurrentPoints',
  'GET /front/404':'StudentHomeController.errorHtml',
  // xapi utils
  'GET /front/api/v1/student/interactive/utils':'StudentHomeController.getAccessUtils',
  'GET /front/api/v1/teacher/interactive/utils':'TeacherHomeController.getAccessUtils',
  // rate front
   'GET /front/student/api/v1/isRatedBy/:type/:courseId':'StudentHomeController.isRatedByUser',
   'GET /front/teacher/api/v1/isRatedBy/:type/:courseId':'TeacherHomeController.isRatedByUser',
   'POST /front/student/api/v1/rate/:type/:courseId':'StudentHomeController.rateCourse',
   'POST /front/teacher/api/v1/rate/:type/:courseId':'TeacherHomeController.rateCourse',
  //blog_front
    'GET /front/public/api/v1/blogcategories':'HomeController.getBlogsCategories',
    'GET /front/public/api/v1/blogcategories/:slug':'HomeController.getBlogsByCategory',
    'GET /front/public/api/v1/blogs':'HomeController.getBlogsByCategory',
    'GET /front/public/api/v1/blogs/:slug':'HomeController.getBlogsBySlug',
    //public_courses
    'GET /front/public/api/v1/coursinteractive/:type/:id':'HomeController.accessPublicCourse',
    'GET /front/public/api/v1/sitemapinfo':'HomeController.getSlugs' 




  
  





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
