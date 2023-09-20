const resolveError = require("../../utils/errors/resolveError")
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


}