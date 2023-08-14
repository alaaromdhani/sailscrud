const SqlError = require("../../utils/errors/sqlErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports={
    getThemes:async (req,res)=>{
        try{
            const themes = await Theme.findAll({
            })
            return DataHandlor(req,themes,res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }
    },
    getCoachingVideos:async (req,res)=>{
        try{
            const {theme_id} = req.query
            let where={}
            if(theme_id){
                where.theme_id = theme_id
            }
            return DataHandlor(req,await CoachingVideo.findAll({
                where
            }),res)
    
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }


    }

    
}