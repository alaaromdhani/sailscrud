/**
 * Api/SoftSkillsVideoController.js
 *
 * @description :: Server-side logic for managing soft_skills_videos endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { SoftskillsvideoShema } = require("../../utils/validations/SoftskillsvideoSchema");


module.exports = {
  async create(req, res) {
    const createVideoCourseValidation = schemaValidation(SoftskillsvideoShema)(req.body)
    if(createVideoCourseValidation.isValid){
      try {
        let c  = req.body
        c.rating=0
        c.addedBy = req.user.id
        return DataHandlor(req,await SoftSkillsVideo.create(c),res)
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:createVideoCourseValidation.message}),res)
    }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(SoftSkillsVideo.sequelize.models.SoftSkillsVideo.rawAttributes);


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
      const { count, rows } = await SoftSkillsVideo.findAndCountAll({
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
      return ErrorHandlor(req,new SqlError(error,res));
    }
  },

  async findOne(req, res) {
    try {
      const data = await SoftSkillsVideo.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'SoftSkillsVideo not found' });
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    console.log(Object.keys(sails.services.softskillsservice))
    sails.services.softskillsservice.updateSkVideo(req,(err,data)=>{
   
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })
  },

  async destroy(req, res) {
    sails.services.softskillsservice.deleteSkVideo(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })
  },
};
