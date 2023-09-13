const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { UpdateLivraisonShema } = require("../../utils/validations/LivraisonSchema")

module.exports= {
    updateLivraison:(req)=>{
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(UpdateLivraisonShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:bodyValidation.message}))
            }
        }).then(()=>{
            return Livraison.findByPk(req.params.id)
        }).then(l=>{
            return l.update(req.body)
        })

    }

}