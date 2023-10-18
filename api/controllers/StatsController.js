const { Op } = require("sequelize")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")
const SqlError = require("../../utils/errors/sqlErrors")

module.exports={
    count:async (req,res)=>{
        try{
        let {roles} = sails.config.custom

        let dashboardRoles = Object.keys(roles).filter(k=>roles[k].dashboardUser).map(k=>roles[k].name)
        
        return DataHandlor(req,await Promise.all([
            User.count({
                include:{
                    model:Role,
                    where:{
                        name:{
                            [Op.in]:dashboardRoles
                        }
                    }
                }
            },),
            User.count({
                include:{
                    model:Role,
                    where:{
                        name:{
                            [Op.eq]:roles['teacher'].name
                        }
                    },
                }
            }),User.count({
                include:{
                    model:Role,
                    where:{
                        name:roles['parent'].name
                    },
                }
            }),
            User.count({
                include:{
                    model:Role,
                    where:{
                        name:roles['student'].name
                    },
                }
            }),
            CoachingVideo.count(),
            Course.count({where:{
                type:'cours'
            }},),Course.count({where:{
                type:'exam'
            }},),
            SoftSkills.count()           

        ]).then(([staff,teachers,parent,students,coachingVideos,courses,exams,softskills])=>{
            return {staff,teachers,parent,students,coachingVideos,courses,exams,softskills}
        }),res)
    }catch(e){
        console.log(e)
       return ErrorHandlor(req,new SqlError(e),res) 
    }
    }
}