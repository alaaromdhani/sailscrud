const SqlError = require("../../utils/errors/sqlErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports={
    create:async (req,res)=>{
        if(req.operation){
            if(req.operation.error){

                return ErrorHandlor(req,req.operation.error,res)
            }
            else{
                try{
                let user = req.operation.data
                user.profilePicture = (await Upload.create(req.upload)).link
                return DataHandlor(req,await user.save(),res)
                }catch(e){
                    
                    if(req.operation.data){
                        await user.destroy()
                    }
                    return ErrorHandlor(req,new SqlError(e),res)
                }
            }
        }else{
            if(req.body.niveau_scolaire_id){
                req.body.niveau_scolaire_id = parseInt(req.body.niveau_scolaire_id)
            }
            sails.services.studentservice.createStudent(req,(err,data)=>{
                if(err){
                    return ErrorHandlor(req,err,res)
                }
                else{
                    return DataHandlor(req,data,res)
                }
            })
        }



    }




}