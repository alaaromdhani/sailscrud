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
  getOtherChildren:(req)=>{
    
    return sails.services.otherfrontservice.getAllParentPerchases(req).
         then(result=>{
            let {ann,where} =result
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
                        required:true,
                        where:{
                            id:req.params.other_id  
                        },
                        include:{
                            model:OtherInteractive,
                            include:{
                                model:ActivityState,
                                foreignKey:'other_interactive_id',
                                attributes:['agent_id','progression'],
                                include:{
                                    model:Agent,
                                    foreignKey:'agent_id',
                                    attributes:['user_id'],
                                    where:{
                                        user_id:ann.user_id
                                    },
                                    required:true    
                                },
                                required:false,

                            },
                            foreignKey:'parent',
                            where:{
                                tracked:true
                            },
                            required:false
                        }
                       
                    }
                    ]
                })
         
          }).then(c=>{
            if(!c){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return c
            }
          })
        
    },
    //student space
    canAccessCtypes:(req)=>{
        const {nb_paid_tremestres} = sails.config.custom.others
        return (req.user.AnneeNiveauUsers.filter(ann=>ann.type==='paid').length>nb_paid_tremestres)    
    },
    getCtypesStudent:(req)=>{
        const canAccessPrivate = sails.services.otherfrontservice.canAccessCtypes(req)
        
        return CType.findAll({
            attributes:['id','name','thumbnail','description','free'],
        include:[{
            model:NiveauScolaire,
            attributes:['id'],
            through:'types_ns',
            where:{
                id:req.current_niveau_scolaire
            },required:true
        },{
            model:Upload,
            foreignKey:'thumbnail',
            attributes:['link']
        }]
        }).then(types=>{
            return {types,canAccessPrivate}   
        })
    },
    getCtypesChildren:(req)=>{
         let canAccessPrivate =  sails.services.otherfrontservice.canAccessCtypes(req)    
         let where={id:req.params.cTypeId}
         if(!canAccessPrivate){
            where.free=true        
         }       
        return  CType.findOne({where,
                include:[{
                            model:NiveauScolaire,
                            through:'types_ns',
                            where:{
                                id:req.current_niveau_scolaire
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
                .then(c=>{
                if(!c){
                    return Promise.reject(new RecordNotFoundErr())
                }
                else{
                    return {types:c,canAccessPrivate}
                }
              })
            
        
    },
    getOthersChildrenStudent:(req)=>{
        let canAccessPrivate =  sails.services.otherfrontservice.canAccessCtypes(req)    
        let where={}
        if(!canAccessPrivate){
            where={free:true}
        }
        return  CType.findOne({where,
            include:[{
                model:NiveauScolaire,
                through:'types_ns',
                where:{
                    id:req.current_niveau_scolaire
                },
                attributes:['id'],
                required:true
            },
            {
                model:OtherCourse,
                foreignKey:'type',
                required:true,
                where:{
                    id:req.params.other_id  
                },
                include:[{
                    model:OtherInteractive,
                    include:{
                        model:ActivityState,
                        foreignKey:'other_interactive_id',
                        attributes:['agent_id','progression'],
                        include:{
                            model:Agent,
                            foreignKey:'agent_id',
                            attributes:['user_id'],
                            where:{
                                user_id:req.user.id
                            },
                            required:true    
                        },
                        required:false,

                    },
                    foreignKey:'parent',
                   
                    required:false
                },
                 { 
                    model:OtherDocument,
                    attributes:['id','name','description'], 
                    include:{
                        model:Upload,
                        foreignKey:'document',
                        attributes:['link']
                    },   
                    foreignKey:'parent',
                    
                },
                { 
                    model:OtherVideo,
                    attributes:['id','name','description','source','url'], 
                    
                    foreignKey:'parent',
                    
                }
                ]
               
            }
            ]
        }).then(t=>{
            if(!t){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return t
            }
        })

    

    },
    accessCourse:(req)=>{
         let canAccessPrivate = sails.services.otherfrontservice.canAccessCtypes(req)
         
         if(canAccessPrivate){
        
            console.log('viewing access' ,req.user.username)
            return OtherInteractive.findOne({
                where:{
                    id:req.params.id
                },
                include:{
                    model:OtherCourse,
                    foreignKey:'parent',
                    include:{
                        model:CType,
                        foreignKey:'type',
                        include:{
                            model:NiveauScolaire,
                            through:'types_ns',
                            where:{
                                id:req.current_niveau_scolaire
                            },
                            required:true
                            

                        },
                        required:true
                    },
                    required:true
                    
                }
 
            })
         }
         else{
            return OtherInteractive.findByPk({where:{
                id:req.params.id
            },include:{
                model:OtherCourse,
               
                attributes:['id'],
                include:{
                    model:CType,
                    foreignKey:'type',
                    attributes:['id'],
                    where:{
                        free:true
                    },
                    
                    include:{
                        model:NiveauScolaire,
                        through:'types_ns',
                        where:{
                            id:req.current_niveau_scolaire         
                        },
                        attributes:['id'],
                        required:true,
                    },
                    required:true,
                },
                required:true
            }})
         }

    }




  



}