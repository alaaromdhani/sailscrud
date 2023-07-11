/**
 * Api/SoftSkillsDocumentController.js
 *
 * @description :: Server-side logic for managing soft_skills_document endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");


module.exports = {
  async create(req, res) {
   if(req.operation){
      if(req.operation.error){
        return ErrorHandlor(req,req.operation.error,res)
      }
      else{
        try{
          const upload = await Upload.create(req.upload)
          let data = req.operation.data
          data.document = upload.id 
          return DataHandlor(req,await data.save(),res) 
        }catch(e){
          return ErrorHandlor(req,new SqlError(e),res)
        }
      }
  }
  else{
    sails.services.softskillsservice.createDocumentSK(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })
      
  }
  
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(SoftSkillsDocument.sequelize.models.SoftSkillsDocument.rawAttributes);


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
      const { count, rows } = await SoftSkillsDocument.findAndCountAll({
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
      },res);
    } catch (error) {
      return ErrorHandlor(req,error,res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await SoftSkillsDocument.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req, new SqlError(err),res);
    }
  },

  async update(req, res) {
   sails.services.softskillsservice.updateDocSK(req,(err,data)=>{
        if(err){
            return ErrorHandlor(req,err,res)
        }
        else{
            return DataHandlor(req,data,res)
        }
    })
  },

  async destroy(req, res) {
    sails.services.softskillsservice.deleteDocSK(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
  })
  },
  rateSoftSkill:(req,res)=>{
    sails.services.softskillsservice.rateSoftSkills(req,"document",(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
    })
  }
};
