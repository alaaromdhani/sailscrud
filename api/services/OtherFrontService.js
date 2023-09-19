const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")

module.exports={
  //parent space
    getAllParentPerchases:(req)=>{
        return AnneeNiveauUser.findAll({include:{
            model:User,
            foreignKey:'user_id',
            attributes:['addedBy'],
            where:{
                addedBy:req.user.id
            },
            required:true
        }}).then(ann=>{
            const {nb_paid_tremestres} = sails.config.custom.others
            let where={}
            let a = ann.filter(a=>a.id==parseInt(req.params.id))[0]
            if(!a){
                return Promise.reject(new RecordNotFoundErr())
            }
            if(ann.map(a=>a.type).filter(a=>a.type="paid").length<nb_paid_tremestres){
                where={free:true}
            }
            else{
                return {ann:a,where }
            }

        })
    },
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
        let {ann,where} =await sails.services.otherfrontservice.getAllParentPerchases(req)
        if(ann){
            
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
        
    return sails.services.otherfrontservice.getAllParentPerchases(req).
         then(result=>{
            let {ann,where}=result
            if(!ann){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                where.id =cTypeId
                
            
              return  CType.findOne({where,
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
  getOtherChildren:()=>{
    return sails.services.otherfrontservice.getAllParentPerchases(req).
         then(ann=>{
           
            if(!ann.map()){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                let where ={id:cTypeId}
                if(ann.dataValues.type!=='paid'){
                    where.free=true
                }
            
              return  CType.findOne({where,
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
        
        
        

   


   

  }


  



}