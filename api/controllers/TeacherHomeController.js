const resolveError = require("../../utils/errors/resolveError")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = {
    //classrooms routes
    createClassroom:async (req,res)=>{
        try{
            await sails.services.teacherhomeservice.classroom.createClassroom(req)
            return DataHandlor(req,{message:'تم إنشاء الفصل الدراسي بنجاح'},res) 
            
        }catch(e){

            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getAvailableSchoolLevels:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.classroom.getAvailableSchoolLevels(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    getTrimestres:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.classroom.getTrimestres(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    getAllClassRooms:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.classroom.getAllClassRooms(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    getPayableTrimestre:async(req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.getPayableTrimestres(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    canAddFourthTrimestre:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.canAddFourthTrimestre(req),res)
        }
        catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    addToCart:async (req,res)=>{
        try{
            await sails.services.teacherhomeservice.cart.addToCart(req)
            return DataHandlor(req,{message:'تمت الإضافة إلى سلة التسوق بنجاح'},res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    readCart:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.readCart(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    removeFromCart:async (req,res)=>{
        try{
            await sails.services.teacherhomeservice.cart.removeFromCart(req)
            return DataHandlor(req,{message:'تم الحذف من سلة التسوق بنجاح'},res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    createOrder:async(req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.createOrder(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }


    },
    getOrder:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.getOrder(req),res)
        }
        catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    findAllOrders:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.findAllOrders(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)

        }
    },
    applicateCoupon:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.applicateCoupon(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     createAdresse:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.createAdresse(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     getAdresses:async (req,res)=>{
        try{
            let data =await  Adresse.findAll({
                where:{
                  addedBy:req.user.id
                },
                attributes:['adresse','postal_code','phonenumber','state_id'],
                include:{
                    model:State,
                    foreignKey:'state_id',
                    attributes:['name']
                }
            })
            return DataHandlor(req,data,res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }
    },
     deleteAdresse:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.deleteAdresse(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     createLivraison:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.createLivraison(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     payOrder:async (req,res)=>{
        const {type} = req.params
       if(type==='prepaidCard'){
                try{
                    return DataHandlor(req,await sails.services.teacherhomeservice.order.payUsingPrepaidCart(req),res)
                }catch(e){
                    return ErrorHandlor(req,resolveError(e),res)
        
                }
        }
        else if(type==='virement'){
            try{
                return DataHandlor(req,await sails.services.teacherhomeservice.order.payUsingVirement(req),res)
            }catch(e){
                return ErrorHandlor(req,resolveError(e),res)
            }
        }
        else if(type==='livraison'){
            try{
                return DataHandlor(req,await sails.services.teacherhomeservice.order.payLivraison(req),res)
            }catch(e){
                return ErrorHandlor(req,resolveError(e),res)
            }
        }
        else{
            return ErrorHandlor(req,new ValidationError({message:'الرجاء إدخال نوع دفع صالح'}),res)
        }

    },
    getMatieres:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.courses.getMatieres(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getCourses:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.courses.getCourses(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getCoursesChildren:async (req,res)=>{
        try{    
            return DataHandlor(req,await sails.services.teacherhomeservice.courses.getCoursesChildren(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)           
        }

    }

    





}