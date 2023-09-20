if(sails.services.teacherhomeservice){
    return sails.services.teacherhomeservice
}
else{
    let teacherhomeservice = {}
    teacherhomeservice.classroom=require('./teacherUtils/ClassroomService')
    teacherhomeservice.cart=require('./teacherUtils/Cart')
  
    module.exports = teacherhomeservice
}