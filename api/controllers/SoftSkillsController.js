/**
 * Api/SoftSkillsController.js
 *
 * @description :: Server-side logic for managing soft_skills endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");


module.exports = {
  async create(req, res) {
    sails.services.softskillsservice.createSoftSkills(req,(err,data)=>{
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
      const attributes = Object.keys(SoftSkills.sequelize.models.SoftSkills.rawAttributes);


      // Create the filter conditions based on the search query
      const where = search
        ? {
          [Sequelize.Op.or]: attributes.map((attribute) => ({
            [attribute]: {
              [Sequelize.Op.like]: '%'+search+'%',
            },
          })),
        }
        : {};

      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await SoftSkills.findAndCountAll({
        where,
        order,
        include:{ 
          model:NiveauScolaire,
          through:'soft_skills_ns'

        },
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
    } catch (error) {
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await SoftSkills.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    sails.services.softskillsservice.updateSoftSkills(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
     })
  },

  async destroy(req, res) {
    sails.services.softskillsservice.deleteSoftSkills(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
     })
  },
  async findAllChildren(req,res){
    console.log(req.params.id)
    try {
      let data =await SoftSkills.findByPk(req.params.id)
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
         ModelReference = SoftSkillsDocument
         attributes = Object.keys(SoftSkillsDocument.sequelize.models.SoftSkillsDocument.rawAttributes);
       }
       if(type=="interactive"){
         ModelReference = SoftSkillsInteractive
         attributes = Object.keys(SoftSkillsInteractive.sequelize.models.SoftSkillsInteractive.rawAttributes);
       }
       if(type=="video"){
         ModelReference = SoftSkillsVideo
         attributes = Object.keys(SoftSkillsVideo.sequelize.models.SoftSkillsVideo.rawAttributes);
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
       let findOptions = {
        where,
        order,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      }
      
       if(type=="document"){
        findOptions.include = {
          model:Upload,
          foreignKey:'document',
          attributes:['file_name'],
          
       }
       }
       where.parent = req.params.id
       const {count,rows} = await ModelReference.findAndCountAll(findOptions);
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
       
         return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
       
         
       
     } catch (err) {
       console.log(err)
         return ErrorHandlor(req,new SqlError(err),res)
     }
  


  }
};
