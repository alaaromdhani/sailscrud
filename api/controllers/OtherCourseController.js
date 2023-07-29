/**
 * Api/OtherCourseController.js
 *
 * @description :: Server-side logic for managing other_course endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");


module.exports = {
  async create(req, res) {
   sails.services.otherservice.createOtherCourse(req,(err,data)=>{
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
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(OtherCourse.sequelize.models.OtherCourse.rawAttributes);


      // Create the filter conditions based on the search query
      let  where = search
        ? {
          [Sequelize.Op.or]: attributes.map((attribute) => ({
            [attribute]: {
              [Sequelize.Op.like]: '%'+search+'%',
            },
          })),
        }
        : {};

      (req.query.type && parseInt(req.query.type))?where.type =req.query.type:undefined
        

      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await OtherCourse.findAndCountAll({
        include:{
          model:CType,
          attributes:['name']
        },
        where,
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
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await OtherCourse.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    sails.services.otherservice.updateOtherCourse(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
     })
  },
  findChildren:async (req,res)=>{
    console.log(req.params.id)
    try {
      let data =await OtherCourse.findByPk(req.params.id)
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
         ModelReference = OtherDocument
         attributes = Object.keys(OtherDocument.sequelize.models.OtherDocument.rawAttributes);
       }
       if(type=="interactive"){
         ModelReference = OtherInteractive
         attributes = Object.keys(OtherInteractive.sequelize.models.OtherInteractive.rawAttributes);
       }
       if(type=="video"){
         ModelReference = OtherVideo
         attributes = Object.keys(OtherVideo.sequelize.models.OtherVideo.rawAttributes);
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
        
      }]
        if(type==="document"){
          includeOptions.push({
            model:Upload,
            foreignKey:'document',
           
            
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
  async destroy(req, res) {
    sails.services.otherservice.deleteOtherCourse(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })    
  },
};
