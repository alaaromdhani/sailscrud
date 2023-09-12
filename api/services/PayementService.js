const path = require("path")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const generateCardCode = require("../../utils/generateCardCode")
const schemaValidation = require("../../utils/validations")
const { UpdateCTypeShemaWithUpload, UpdateCTypeShema, CTypeShemaWithUpload, CTypeShema } = require("../../utils/validations/CTypeSchema")
const { UpdatePackShema, UpdatePackShemaWithoutFile } = require("../../utils/validations/PackSchema")
const { UpdatePrepaidcardShema, UpdatePrepaidcardShemaWithFile } = require("../../utils/validations/PrepaidcardSchema")
const { UpdateSellerShema } = require("../../utils/validations/SellerSchema")

const converter= {
    pack:{validation:{withFile:UpdatePackShema,withoutFile:UpdatePackShemaWithoutFile},hasUpload:true,uploadKey:"image"},
    prepaidcard:{validation:{withFile:UpdatePrepaidcardShema,withoutFile:UpdatePrepaidcardShemaWithFile},hasUpload:true,uploadKey:"image"},
    seller:{validation:UpdateSellerShema},
    ctype:{validation:{withFile:UpdateCTypeShemaWithUpload,withoutFile:UpdateCTypeShema},hasUpload:false,uploadKey:"image"},
 

}

module.exports = {
    updatemodel:(req,callback,withUpload)=>{
            const {validation,hasUpload,uploadKey} = converter[req.options.model]
            const ModelReference = sails.models[req.options.model]
            let bodyData 
            new Promise((resolve,reject)=>{
                let  modelValidation
                if(hasUpload){
                        if(withUpload){
                            console.log('with file')
                            bodyData = {}
                            if(!uploadKey){uploadKey ="upload"
                            }
                            Object.keys(req.body).filter(k=>k!=uploadKey).forEach(k=>{
                                bodyData[k] = req.body[k]
                            })
                            modelValidation = schemaValidation(validation.withFile)(bodyData)
                        }
                        else{
                            console.log('without file')

                            modelValidation = schemaValidation(validation.withoutFile)(req.body)
                        }
                }
                else{
                    modelValidation = schemaValidation(validation)(req.body)
                }

                if(modelValidation.isValid){
                    resolve()
                }
                else{
                    reject(new ValidationError({message:modelValidation.message}))
                }
            }).then(()=>{
                return ModelReference.findByPk(req.params.id,{
                    include:{
                            model:User,
                            foreignKey:'addedBy',
                            include:{
                                model:Role,
                                foreignKey:'role_id'
                            }
                    }
                })
            }).then(m=>{
                return new Promise((resolve,reject)=>{
                    if(m){
                       if(m.User && m.User.Role.weight<=req.role.weight && m.User.id!=req.user.id){
                        return reject(new UnauthorizedError({message:'uou cannot modify this record'}))
                       }
                       return resolve(m)
                    }
                    else{
                        return reject(new RecordNotFoundErr())
                    }
                })
            }).then(m=>{
                if(!bodyData){
                    return m.update(req.body)
                }
                else{
                    return m.update(bodyData)
                }
            }).then(m=>{
                callback(null,m)

            }).catch(e=>{
                console.log(e)
                if(e instanceof RecordNotFoundErr || e instanceof ValidationError|| e instanceof UnauthorizedError){
                    callback(e,null)
                }
                else{
                    callback(new SqlError(e),null)
                }
            }) 

    },
    deleteModel:(req,callback)=>{
        const ModelReference = sails.models[req.options.model]
        return ModelReference.findByPk(req.params.id,{ 
            include:{
                    model:User,
                    foreignKey:'addedBy',
                    include:{
                        model:Role,
                        foreignKey:'role_id'
                    }
            }
        }).then(m=>{
            return new Promise((resolve,reject)=>{
                if(m){
                   if(m.User && m.User.Role.weight<=req.role.weight && m.User.id!=req.user.id){
                    return reject(new UnauthorizedError({message:'uou cannot delete this record'}))
                   }
                   return resolve(m)
                }
                else{
                    return reject(new RecordNotFoundErr())
                }
            })


        }).then(m=>{
            return m.destroy()
        }).then(s=>{
            callback(null,{})

        }).catch(e=>{
            console.log(e)
            if(e instanceof RecordNotFoundErr || e instanceof ValidationError|| e instanceof UnauthorizedError){
                callback(e,null)
            }
            else{
                callback(new SqlError(e),null)
            }
        })

    },
    createCards:(serie_id,nb_cards,addedBy)=>{
        let cardsToAdd=[]
        for(let i=0;i<nb_cards;i++){
            cardsToAdd.push({
                serie_id,
                code:generateCardCode(3),
                addedBy
            })
        }
         return Card.bulkCreate(cardsToAdd) 
     },
     generatePdf:async (serie)=>{
          if(serie && serie.Upload && serie.Cards ){
            if(serie.Cards.length){
                let positionX=0
                let positionY=0
                let textpositionX=80
                let textpositionY=198/2
                let qrpositionX=130
                let qrpositionY=30
                const pdfDocument = require('pdfkit')
                const fs = require('fs')
                const doc = new pdfDocument();
                var QRCode = require('qrcode');
                doc.pipe(fs.createWriteStream(path.join(__dirname,'../../assets/cards.pdf')));
                let counter =0;
                for(let i=0;i<serie.Cards.length;i++){
                    doc.image(path.join(__dirname,'../../assets/'+serie.Upload.path+'/'+serie.Upload.file_name+'.'+serie.Upload.extension), positionX, positionY, {width: 310,height:198})
                    let url = await QRCode.toDataURL(serie.Cards[i].code)
                    doc.image(url,qrpositionX,qrpositionY,{width:40,height:40})
                    doc.fontSize(20).text(serie.Cards[0].code,textpositionX,textpositionY)
                    if(positionX>0){
                        positionX=0
                        positionY+=198
                        textpositionX=80
                        textpositionY+=198
                        qrpositionX=130
                        qrpositionY+=198
                    }
                    else{
                        positionX+=310
                        textpositionX+=310
                        qrpositionX+=310
                    }
                    counter++
                    if(counter>=8){
                        doc.addPage()
                        counter=0
                        positionX=0
                        positionY=0
                        textpositionX=80
                        textpositionY=198/2
                        qrpositionX=130
                        qrpositionY=30
               
                    }
            
                    
                }
                doc.save()
                doc.end()
                return {path:path.join(__dirname,'../../assets')}
            }
            else{

            return Promise.reject(new ValidationError({message:'this series has no cards '}))
            }
          }  
          else{
            console.log('here 2')
            return Promise.reject(new RecordNotFoundErr())
          }
          
     },
     print:(req)=>{
          return PrepaidCard.findByPk(req.params.id,{
            include:[{
                model:Card,
                foreignKey:'serie_id',
                where:{
                        used:false
                },
                required:false
            },
            {
                model:Upload,
                foreignKey:'photo'
            }]
          })
          .then(serie=>{
            if(serie){
                return sails.services.payementservice.generatePdf(serie)
            }
            else{
                console.log('here')
                return Promise.reject(RecordNotFoundErr())
            }
          })  

     }
     
    




}