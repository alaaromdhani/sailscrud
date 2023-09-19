const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")

module.exports={
  //parent space
    getParentPurchase:(req)=>{
    const {id} = req.params
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
            return Promise.reject(new RecordNotFoundErr())
        }
    
  },
  getOthersByCtype:async (req)=>{
    const {cTypeId} = req.params
        
    return sails.services.otherfrontservice.getParentPurchase(req).
         then(ann=>{
            if(!ann){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                let where ={id:cTypeId}
                if(ann.dataValues.type!=='paid'){
                    where.free=true
                }
            
              return  Ctype.findOne({where,
                    include:[{
                        model:NiveauScolaire,
                        through:'types_ns',
                        where:{
                            id:ann.dataValues.niveau_scolaire_id
                        },
                        attributes:['id'],
                        required:true
                    },
                    {
                        model:OtherCourse,
                        foreignKey:'type',
                        required:false
                       
                    }
                    ]
                })
            }
          }).then(c=>{
            if(!c){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return c
            }
          })
        
        
        

   


  },

  



}