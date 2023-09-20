const sequelize = require("sequelize")
const RecordNotFoundErr = require("../../../utils/errors/recordNotFound")
const ValidationError = require("../../../utils/errors/validationErrors")
const schemaValidation = require("../../../utils/validations")
const ClassroomShema = require("../../../utils/validations/ClassroomSchema")

module.exports={

    createClassroom:async (req)=>{
        let createdClassroom
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(ClassroomShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:bodyValidation.message}))
            }
         }).then(()=>{
            return Classroom.findOne({where:{
                addedBy:req.user.id,
                niveau_scolaire_id:req.body.niveau_scolaire_id
            }})

         }).then((c)=>{
            if(c){
                return Promise.reject(new ValidationError())
            }
            else{
                req.body.addedBy = req.user.id
                return Classroom.create(req.body)
            }
         }).then(c=>{
            createdClassroom =c
            return Promise.all([Trimestre.findAll({where:{
                active:true   
            }}),AnneeScolaire.findOne({where:{active:true}})])

        }).then(([trimestres,annee_scolaire_active])=>{
            let perchases = []
            trimestres.forEach(t=>{
                perchases.push({
                    trimestre_id:t.id,
                    annee_scolaire_id:annee_scolaire_active.dataValues.id,
                    niveau_scolaire_id:createdClassroom.niveau_scolaire_id,
                    classroom_id:createdClassroom.id,
                    addedBy:createdClassroom.addedBy,
                    type:'trial',

                })
            })
            return TeacherPurchase.bulkCreate(perchases)
        })  

    },
    getAvailableSchoolLevels:(req)=>{
       return Classroom.findAll({where:{
        addedBy:req.user.id,
       },
        attributes:['niveau_scolaire_id']        
        }).then(ids=>{
            return NiveauScolaire.findAll({where:{
                id:{
                    [sequelize.Op.notIn]:ids.map(i=>i.id)
                },
                active:true
            },attributes:['name_ar','id']})
        })
    },
    getAllClassRooms:(req)=>{
        return Classroom.findAll({where:{
            addedBy:req.user.id,
        },attributes:['id','niveau_scolaire_id','type'],
        include:{
            model:NiveauScolaire,
            foreignKey:'niveau_scolaire_id',
            attributes:['name_ar']
        }
  
        })
    },
    getTrimestres:(req)=>{
        return Classroom.findOne({
            addedBy:req.user.id,
            id:req.params.id
        }).then(c=>{
            if(!c){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return  TeacherPurchase.findAll({where:{
                    classroom_id:c.dataValues.id,
                    
                },attributes:['type','id'],
                include:{
                    model:Trimestre,
                    foreignKey:'trimestre_id',
                    attributes:['name_ar'],
                    where:{
                        active:true
                    },
                 }
                })
            }
        })
    },
    



}