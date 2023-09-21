if(sails.services.teacherhomeservice){
    return sails.services.teacherhomeservice
}
else{
    let teacherhomeservice = {}
    teacherhomeservice.classroom=require('./teacherUtils/ClassroomService')
    teacherhomeservice.cart=require('./teacherUtils/Cart')
    teacherhomeservice.order = require('./teacherUtils/OrderService')
    teacherhomeservice.courses =require('./teacherUtils/coursesService')
    module.exports = teacherhomeservice
}