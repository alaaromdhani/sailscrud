const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")
const { updateStudentSchema } = require("../../utils/validations/StudentSchema")
const sequelize = require('sequelize')
module.exports={
    create:async (req,res)=>{
        if(req.operation){
            if(req.operation.error){

                return ErrorHandlor(req,req.operation.error,res)
            }
            else{
              let user
                try{
                 user = req.operation.data
                user.profilePicture = (await Upload.create(req.upload)).link
                
                
                await user.save()

                
                return DataHandlor(req,{message:'تم اضافة الطالب بنجاح'},res)
                }catch(e){
                 
                    return ErrorHandlor(req,new SqlError(e),res)
                }
            }
        }else{
            
            sails.services.studentservice.createStudent(req,(err,data)=>{
                if(err){
                    return ErrorHandlor(req,err,res)
                }
                else{
                  return DataHandlor(req,{message:'تم اضافة الطالب بنجاح'},res)
              
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
  /*  getCurrentSemestre:(req,res)=>{
      0

    },*/
    getStudentSchoolLevels :async (req,res)=>{
      
      try{
        let canAdd 
        let student = await User.findOne({where:{
          id:req.params.id,
          addedBy:req.user.id
        }})
        if(!student){
          return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        const data = await AnneeNiveauUser.findAll({
          attributes:['id',
          [sequelize.literal(' case when sum( case when `AnneeNiveauUser`.type=\'trial\' then 0 else 1 end)=0 then \'trial\' when sum( case when `AnneeNiveauUser`.type=\'trial\' then 0 else 1 end )=count(*) then \'paid\' else \'halfpaid\' end'),'type']
           
          ],

          where:{
          user_id:req.params.id
        },include:[{
          model:NiveauScolaire,
          foreignKey:'niveau_scolaire_id',
          
          
        },{
          model:AnneeScolaire,
          foreignKey:'annee_scolaire_id',
          
        },{
          model:Trimestre,
          foreignKey:'trimestre_id',
          attributes:['name_ar','id']
        }],
        group:['annee_scolaire_id','niveau_scolaire_id']
        })
        if(data){
          try{
            await sails.services.configservice.canAddSchoolLevel(req.params.id)
            canAdd = true
          }
          catch(e){
          //  console.log(e)
            canAdd=false
          }
     
          return DataHandlor(req, {niveau_scolaires:data,canAdd},res)
        }
        else{
          return DataHandlor(req, {niveau_scolaires:[],canAdd},res)
        }
      }
      catch(e){
        console.log(e)
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
        
        attributes:['id','firstName','lastName','birthDate','username','sex','profilePicture'],})
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
    },
    
     
    





}