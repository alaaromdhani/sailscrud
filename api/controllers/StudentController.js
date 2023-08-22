const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")
const { updateStudentSchema } = require("../../utils/validations/StudentSchema")

module.exports={
    create:async (req,res)=>{
        if(req.operation){
            if(req.operation.error){

                return ErrorHandlor(req,req.operation.error,res)
            }
            else{
                try{
                let user = req.operation.data
                user.profilePicture = (await Upload.create(req.upload)).link
                
                
                  

                
                return DataHandlor(req,await user.save(),res)
                }catch(e){
                    
                    if(req.operation.data){
                        await user.destroy()
                    }
                    return ErrorHandlor(req,new SqlError(e),res)
                }
            }
        }else{
            
            sails.services.studentservice.createStudent(req,(err,data)=>{
                if(err){
                    return ErrorHandlor(req,err,res)
                }
                else{
                    return DataHandlor(req,data,res)
                }
            })
        }



    },
    schoolYearsHistory:async (req,res)=>{
      let u = await User.findOne({
        where:{
          id:req.params.id,
          addedBy:req.user.id
        },
        attributes:[],
        include:{
          model:AnneeNiveauUser,
          foreignKey:'user_id',
          include:[{
            model:NiveauScolaire,
            foreignKey:'niveau_scolaire_id',
          },{
            model:AnneeScolaire,
            foreignKey:'annee_scolaire_id'
          }]

        }
      })
      if(u){
        return DataHandlor(req,u,res)
      }
      else{
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
    },
    find:async (req,res)=>{
        try {
            const page = parseInt(req.query.page)+1 || 1;
            const limit = req.query.limit || 10;
            const search = req.query.search;
            const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
            const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
            const attributes = Object.keys(User.sequelize.models.User.rawAttributes);
      
      
            // Create the filter conditions based on the search query
            let where = search
              ? {
                [Sequelize.Op.or]: attributes.map((attribute) => ({
                  [attribute]: {
                    [Sequelize.Op.like]: '%'+search+'%',
                  },
                })),
              }
              : {};
              where.addedBy=req.user.id
      
            // Create the sorting order based on the sortBy and sortOrder parameters
            const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];
      
            // Perform the database query with pagination, filtering, sorting, and ordering
            const { count, rows } = await User.findAndCountAll({
              where,
              attributes:{exclude: ['password','addedBy','updatedBy']},
              include:{
                model:AnneeNiveauUser,
                foreignKey:'user_id',
                attributes:['niveau_scolaire_id'],
                include:[{
                
                  model:AnneeScolaire,
                  foreignKey:'annee_scolaire_id',
                  where:{active:true},
                  attributes:[]
                }
                ]
                
              },

      
              order,
              limit: parseInt(limit, 10),
              offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
            });
      
            return res.json({
              success: true,
              data: rows,
              page: parseInt(page, 10),
              limit: parseInt(limit, 10),
              totalCount: count,
              totalPages: Math.ceil(count / parseInt(limit, 10)),
            });
          } catch (error) {
            return res.serverError(error);
          }


    },
    addSchoolLevel:async (req,res)=>{
      sails.services.studentservice.addSchoolLevel(req,(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
      })
    },
    getStudentSchoolLevels :async (req,res)=>{
      
      try{
        const data = await AnneeNiveauUser.findAll({where:{
          user_id:req.params.id
        },include:[{
          model:User,
          attributes:['addedBy'],
          where:{
            addedBy:req.user.id
          },
          required:true  
        },{
          model:AnneeScolaire, 
          foreignKey:'annee_scolaire_id'
        },{
          model:NiveauScolaire,
          foreignKey:'niveau_scolaire_id'
        }]
        })
        return DataHandlor(req,data,res)
      }
      catch(e){
        return ErrorHandlor(req, new SqlError(e),res)
      }

    },
    getschoolLevels:async (req,res)=>{
        try{
            return DataHandlor(req,await NiveauScolaire.findAll({where:{
                active:true
            },attributes:['id','name_ar']}),res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }

    },
    updateStudent:async (req,res)=>{
        if(req.operation){
            if(req.operation.error){
              return ErrorHandlor(req,req.operation.error,res)
            }
            else{
                try{
                  let upload = await Upload.create(req.upload) 
                let  user = req.operation.data
                user.profilePicture  = upload.link
                return DataHandlor(req,await user.save(),res)
                } 
                catch(e){
                    return ErrorHandlor(req,new SqlError(e),res)
                } 
    
            }
    
          }else{
              sails.services.userservice.update(req,(err,data)=>{
                if(err){
                  return ErrorHandlor(req,err,res)
                }
                else{
                  return DataHandlor(req,data,res)
                }
    
    
              },updateStudentSchema)
          }
          


    },
    findOneStudent:async (req,res)=>{
      try{
        const data = await User.findOne({where:{
        
          id:req.params.id,
          addedBy:req.user.id,
        },
        attributes:{exclude: ['password','addedBy','updatedBy']},
        include:{
          model:AnneeNiveauUser,
          foreignKey:'user_id',
          attributes:['niveau_scolaire_id'],
          include:{
          
            model:AnneeScolaire,
            foreignKey:'annee_scolaire_id',
            where:{active:true},
            attributes:[]
          },
          
          
        },
        attributes:['firstName','lastName','birthDate','username','sex','profilePicture'],})
         if(!data){
          return ErrorHandlor(req,new RecordNotFoundErr(),res)
         } 
         return DataHandlor(req,data,res)
      }catch(e){
        ErrorHandlor(req,new SqlError(e),res)
      }

    },
    destroy:async (req,res)=>{
      sails.services.studentservice.removeStudent(req,(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
      })
    }





}