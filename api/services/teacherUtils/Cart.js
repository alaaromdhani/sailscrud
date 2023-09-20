const sequelize = require('sequelize')
const schemaValidation = require('../../../utils/validations')
const TeacherperchaseShema = require('../../../utils/validations/TeacherperchaseSchema')
const ValidationError = require('../../../utils/errors/validationErrors')
const RecordNotFoundErr = require('../../../utils/errors/recordNotFound')
module.exports={
    getPayableTrimestres:(req)=>{
        let {classroom_id} = req.params
        return TeacherPurchase.findAll({where:{
            addedBy:req.user.id,
            classroom_id,
            order_id:null,
            cart_detail_id:null,
            type:{
                [sequelize.Op.ne]:'paid'
            }
        },
        attributes:['id','type'],
        include:{
            model:Trimestre,
            foreignKey:'trimestre_id',
            attributes:['name_ar','id'],
            where:{
                active:true
            }
        }
        })
    },
    canAddFourthTrimestre:(req)=>{
        let allPersuses=[]
        let {annee_niveau_classrooms} = req.body
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(TeacherperchaseShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError())
            }
        }).then(()=>{
         return TeacherPurchase.findAll({where:{
                id:{
                    [sequelize.Op.in]:annee_niveau_classrooms,
                    
                }
            }})
        }).then((purchases)=>{
            allPersuses = allPersuses.concat(purchases)
            if(purchases.length>0){
                
                return TeacherPurchase.findAll({
                    where:{
                        id:{
                            [sequelize.Op.notIn]:annee_niveau_classrooms,
                        },
                        classroom_id:purchases[0].classroom_id,
                        addedBy:req.user.id,
                        cart_detail_id:{
                            [sequelize.Op.ne]:null
                        }          
                }})
            }
            else{
                return Promise.reject(new RecordNotFoundErr())
            }
        }).then(perchases=>{
            
            allPersuses = allPersuses.concat(perchases)
            console.log(allPersuses.length)
            if(allPersuses.length==4 || (allPersuses.length==3 && !allPersuses.map(p=>p.trimestre_id).includes(4))){
                return {canAddForthTrimestre:true} 
            }
            else{
                return {canAddForthTrimestre:false}
            }
        })
    },
    addToCart:(req)=>{
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(TeacherperchaseShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError())
            }
        }).then(()=>{
            let {annee_niveau_classrooms} =req.body
            return TeacherPurchase.findAll({where:{
                id:{
                    [sequelize.Op.in]:annee_niveau_classrooms,
                    addedBy:req.user.id
                }
            }})
        }).then(purchases=>{
            if(purchases.length){
                let classroom_id = p[0].classroom_id
                if(purchases.every(p=>p.classroom_id==classroom_id)){
                    
                }
                else{
                    return Promise.reject(new ValidationError())
                }
            }
            else{
                return Promise.reject(new ValidationError())
            }
        })

    }
}