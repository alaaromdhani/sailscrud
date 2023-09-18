const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")

module.exports={
  //parent space
    getParentPurchase:(req)=>{
    const {id} = req.params.id
    return AnneeNiveauUser.findOne({where:{
        id,
    },include:{
        model:User,
        foreignKey:'user_id',
        where:{
            addedBy:req.user.id
        },
        attributes:['addedBy']
    }})
  },
  getCtypes:async (req)=>{
    try{
        let ann =await sails.services.otherfrontservice.getParentPurchase(req)
        if(ann){
            let where={}
            if(ann.dataValues.type!=='paid'){
                where = {
                    free:true
                }
            }
            return CType.findAll({
                where,
                attributes:['id','name','thumbnail','description'],
            include:[{
                model:NiveauScolaire,
                attributes:['id'],
                through:'types_ns',
                where:{
                    id:ann.dataValues.niveau_scolaire_id
                },required:true
            },{
                model:Upload,
                foreignKey:'thumbnail',
                attributes:['link']
            }]
            })
    
        }else{
            throw new RecordNotFoundErr()
        }
    }catch(e){
        return Promise()
    }

  },
  getOthersByCtype:async (req)=>{
    try{
        const {cTypeId} = req.params
        let ann = await sails.services.otherfrontservice.getParentPurchase(req)
        
        if(!ann){
            throw new RecordNotFoundErr()
        }
        
        else{
            let where ={}
            if(ann.dataValues.type!=='paid'){
                where={
                    free:true
                }
            }
            Ctype.findOne({where,
                include:[{
                    model:NiveauScolaire,
                    through:'types_ns',
                    where:{
                        id:ann.dataValues.niveau_scolaire_id
                    },
                    attributes:['id']
                },
                {
                    model:OtherInteractive,
                    foreignKey:''
                }
                ]
            })
          
        }
       /* const {courseId,TrimestreId} = req.params 
        let ann = req.user.AnneeNiveauUsers.filter(a=>a.dataValues.trimestre_id===parseInt(TrimestreId)).at(0)
        //console.log(req.user.AnneeNiveauUsers)
        let canAccessPrivate =(ann && ann.type=='paid')?true:false
        //console.log("canAccessPrivate",canAccessPrivate)
    
   
        try{
            let data = await Course.findOne({where:{
                trimestre_id:TrimestreId,
                id:courseId,
                type:'exam',
                niveau_scolaire_id:req.current_niveau_scolaire,
                active:true
            },include:[{
                model:CoursInteractive,
                
                foreignkey:'parent',
                attributes:['id','name','description','thumbnail','rating','status'],
                where:{
                   validity:true,
                   active:true 
                },
                include:{
                        
                    model:ActivityState,
                    foreignKey:'c_interactive_id',
                    attributes:['agent_id','progression'],
                    include:{
                            model:Agent,
                            attributes:['user_id'],
                            foreignKey:'agent_id',
                            where:{
                            user_id: req.user.id
                            },
                            required:true
                          },
                        required:false

                    }, 
                required:false
            },
            {
               attributes:['id','name','description','rating','status'],
                 model:CoursVideo,
                foreignkey:'parent',
                where:{
                   validity:true,
                   active:true 
                },
                required:false
            },
            {
                model:CoursDocument,
                foreignkey:'parent',
                attributes:['id','name','description','rating','status'],
                include:{
                 model:Upload,
                 foreignkey:'document',
                 attributes:['link']
                }, 
                where:{
                   validity:true,
                   active:true 
                },
                required:false
            }]})
            if(!data){
                throw new RecordNotFoundErr()
            }
            return DataHandlor(req,{"course":data,canAccessPrivate},res)
        }catch(e){
 
            return ErrorHandlor(req,resolveError(e),res)
        }*/


    }catch(e){
        return Promise.reject(resolveError(e))
    }


  },
  



}