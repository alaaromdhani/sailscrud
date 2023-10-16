const { updateNormalUserProfile } = require("../../utils/validations/UserSchema")
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require("../../utils/errors/sqlErrors");
const UnkownError = require("../../utils/errors/UnknownError");
const ValidationError = require("../../utils/errors/validationErrors");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
module.exports={
  profileCallback:(req,res)=>{
    DataHandlor(req,req.user,res);
  },
    updateProfile:async (req,res)=>{
      //console.log(req.body)
        if(req.operation){
            if(req.operation.data){
                  return DataHandlor(req,req.operation.data,res)
            }
            else{
              return ErrorHandlor(req,req.operation.error,res)
            }
          }
          else{
              if(req.files && req.files.length){
                return ErrorHandlor(req,new UnkownError(),res)
              }
              else{
                sails.services.userservice.profileUpdater(req,async (err,data)=>{
                    if(err){
                      return ErrorHandlor(req,err,res)
                    }
                    else{
                        try{
                          return DataHandlor(req,await data.save(),res)
                        }
                        catch(e){
                          if( e instanceof ValidationError){
                            return ErrorHandlor(req,e,res)
                          }
                          return ErrorHandlor(req,new SqlError(e),res)
                        }
                    }
                },updateNormalUserProfile)
              }
          }
      
        
    },
    getMatiereByNiveau:async (req,res)=>{
      try{
        let data  = await NiveauScolaire.findByPk(req.params.NiveauScolaireId,{
          include:{
            model:Matiere,
            through:MatiereNiveau,
            include:{
              model:Upload,
              foreignKey:'image',
              attributes:['link']

            }
          }
        })
        if(!data){
          return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
          return DataHandlor(req,data.Matieres,res)
        }
      }catch(e){
        console.log(e)
        return ErrorHandlor(req,new SqlError(e),res)
      }
      
    },
    
    updatePhoneNumber:(req,res)=>{
        sails.services.userservice.updatePhoneNumber(req,(err,data)=>{

                    if(err){
                        return ErrorHandlor(req,err,res)
                    }
                    else{
                        return DataHandlor(req,data,res)
                    }

        })


    },
    
    getTrimestres:async (req,res)=>{
      try{
        return DataHandlor(req,await Trimestre.findAll({where:{
          active:true
        }}),res)
      }catch(e){
        return ErrorHandlor(req,new SqlError(e),res)
      }
    },
    getTopStudent:async (req,res)=>{
      try{
        return DataHandlor(req,await sails.services.studentservice.getStudentStatisticsFront(req)
        ,res)
      }catch(e){
        console.log(e)
        return ErrorHandlor(req,new SqlError(e),res)

      }

    },
    getPacks:async (req,res)=>{
      try{
        return DataHandlor(req,await Pack.findAll({
          attributes:['name','price','initialPrice','nbTrimestres','reduction'],
          include:{
            model:Upload,
            foreignKey:'photo',
            attributes:['link']
          }
        })
        ,res)
      }catch(e){
        console.log(e)
        return ErrorHandlor(req,new SqlError(e),res)

      }

    }

   
    


}