/**
 * Api/CourseController.js
 *
 * @description :: Server-side logic for managing course endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const Sequelize = require('sequelize')
const schemaValidation = require('../../utils/validations');
const {CourseShema} = require('../../utils/validations/CourseSchema');
const RateShema = require('../../utils/validations/RateSchema');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const recordNotfFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');

module.exports = {
  
  async create(req, res) {
      sails.services.courseservice.createCourse(req,(err,data)=>{
          if(err){
            return ErrorHandlor(req,err,res)
          }
          else{
            return DataHandlor(req,data,res)
          }
       })  
  },

  async find(req, res) {
    try {
      const matiere_id = req.query.matiere
      const type = req.query.type?req.query.type:"cours"
       if(type!="exam" && type!="cours" ){
        return ErrorHandlor(req,new ValidationError({message:'a valid type is required'}),res)
      } 
      const niveau_scolaire_id =   req.query.ns
      const chapitre_id = req.query.chapitre
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Course.sequelize.models.Course.rawAttributes);


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
        where.type = type
    
        if(matiere_id){
          where.matiere_id = matiere_id
        } 
        if(niveau_scolaire_id){
          where.niveau_scolaire_id = niveau_scolaire_id
        }
      
      // Create the sorting order based on the sortBy and sortOrder parameters
        let whereChapitre = {

        }
        if(chapitre_id){
          whereChapitre = {
            chapitre_id
          }
        }
        let includeOptions = [{
          model:Matiere,
          foreignKey:'matiere_id',
          attributes:['name']
        },{
          model:NiveauScolaire,
          foreignKey:'niveau_scolaire_id',
          attributes:['name_fr','name_ar']
        },
        
       ]
       if(type==="cours"){
        includeOptions.push({
          model:Module,
          foreignKey:'module_id',
          attributes:['name'],
          where:whereChapitre

        })
       }
       if(type==="exam"){
        includeOptions.push({
          model:Trimestre,
          foreignKey:'trimestre_id'
        })
       }
      const order = [[sortBy, sortOrder]];
       let whereNs = {}
       if(req.role.name===sails.config.custom.roles.intern_teacher.name || req.role.name===sails.config.custom.roles.inspector.name ){
        whereNs ={
          [Sequelize.Op.or]:[{
            intern_teacher:req.user.id
          },{
            inspector:req.user.id
          }]
        }
       } 
      // Perform the database query with pagination, filtering, sorting, and ordering
      console.log(whereNs)
      console.log(where) 
           let { count, rows } = await Course.findAndCountAll({
      
        where,
        include:includeOptions,
        order,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      });
      

      return DataHandlor(req,{
        success: true,
        data: rows,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      },res)
    } catch (error) {
      console.log(error)
      return ErrorHandlor(req,new SqlError(error),res)
    }
  },
  
  async findOne(req, res) {
   try{
      const data = await Course.findByPk(req.params.id)
      if(!data){
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res)
   }
   catch(e){
    return ErrorHandlor(req,new SqlError(e),res)
   }
  },

  async update(req, res) {
    try {
      const data = await Course.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new recordNotfFoundErr(),res)
      }
      const updatedCourse = await data.update(req.body);
      return DataHandlor(req,updatedCourse,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async destroy(req, res) {
    try {
      const data = await Course.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new recordNotfFoundErr(),res)
      }
      await data.destroy();
      return DataHandlor(req, {},res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },
  findOneCourse:async(req,res)=>{
    console.log(req.params.id)
  try {
    
    let data =await Course.findByPk(req.params.id)
    if(data){
     const type = req.query.type || "interactive"
     if(type!="interactive" && type!="document" && type!=="video"){
           return ErrorHandlor(req,new ValidationError({message:'type is required'}),res)
     }
     const page = parseInt(req.query.page)+1 || 1;
     const limit = req.query.limit || 10;
     const search = req.query.search;
     const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
     const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
     const order = [[sortBy, sortOrder]];
     let ModelReference 
     let attributes

     if(type=="document"){
       ModelReference = CoursDocument
       attributes = Object.keys(CoursDocument.sequelize.models.CoursDocument.rawAttributes);
     }
     if(type=="interactive"){
       ModelReference = CoursInteractive
       attributes = Object.keys(CoursInteractive.sequelize.models.CoursInteractive.rawAttributes);
     }
     if(type=="video"){
       ModelReference = CoursVideo
       attributes = Object.keys(CoursVideo.sequelize.models.CoursVideo.rawAttributes);
     }
     //let allowed
     let where = search
     ? {
       [Sequelize.Op.or]: attributes.map((attribute) => ({
         [attribute]: {
           [Sequelize.Op.like]: '%'+search+'%',
         },
       })),
     }
     : {};
     where.parent = req.params.id
     let includeOptions = [{
      model:CoursComment,
      
      include:{
         model:User,
         foreignKey:'addedBy',
         attributes:['lastName','firstName','email','profilePicture'],
         include:{
            model:Role,
            foreignKey:'role_id'

         } 
      }
    }]
      if(type==="document"){
        includeOptions.push({
          model:Upload,
          foreignKey:'document',
          attributes:['link'],
          
       })
      }
     const {count,rows} = await ModelReference.findAndCountAll({
         where,
         include:includeOptions,
         order,
         limit: parseInt(limit, 10),
         offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
     });
     return DataHandlor(req,{
       success: true,
       data: rows,
       page: parseInt(page, 10),
       limit: parseInt(limit, 10),
       totalCount: count,
       totalPages: Math.ceil(count / parseInt(limit, 10)),
     },res);
   
    }
    else{
     
       return ErrorHandlor(req,new recordNotfFoundErr(),res)
    }
     
       
     
   } catch (err) {
     console.log(err)
       return ErrorHandlor(req,new SqlError(err),res)
   }

  
},
  treeView:async (req,res)=>{
      const {MatiereId,NiveauScolaireId} = req.query
      if(MatiereId && NiveauScolaireId){
          
          
          const matiere_niveau = await MatiereNiveau.findOne({where:{
              MatiereId,
              NiveauScolaireId
          },include:{
            model:Matiere,
            foreignKey:'MatiereId'
          }}) 
          let includeOptions = [{
            model:Course,
            include:[{
                model:CoursInteractive,
                foreignKey:'parent'
            },
            {
              model:CoursVideo,
              foreignKey:'parent'
          },{
            model:CoursDocument,
            foreignKey:'parent'
        }]

        } ]

          if(matiere_niveau){
            if(req.query.TrimestreId && parseInt(req.query.TrimestreId)){
              includeOptions.push({
                model:Trimestre,
                through:'trimestres_modules',
                where:{
                  id:req.query.TrimestreId
                }
              })
            }
              return DataHandlor(req,{rows:await Module.findAll({
                where:{
                    matiere_niveau_id:matiere_niveau.id
                },
                include:includeOptions

              }),rtl:matiere_niveau.Matiere.rtl},res)

          }
          else{
            return DataHandlor(req,[],res)
          }

      }
      else{
        return ErrorHandlor(req,new ValidationError('the subject level combination is required'),res)
      }


  }

  
};
