/**
 * Api/CoursCommentController.js
 *
 * @description :: Server-side logic for managing cours_comment endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");


module.exports = {
  

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(CoursComment.sequelize.models.CoursComment.rawAttributes);


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
      const { count, rows } = await CoursComment.findAndCountAll({
        where,
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

  async findOne(req, res) {
    try {
      const data = await CoursComment.findByPk(req.params.id,{
        include:{
          model:User,
          foreignKey:'addedBy',
          attributes:['firstName','lastName','profilePicture','username']
          }
      });
      if (!data) {
        return res.status(404).json({ error: 'CoursComment not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    sails.services.subcourseservice.updateCoursComment(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res) 
      }
    })
  },

  async destroy(req, res) {
    sails.services.subcourseservice.deleteCoursComment(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res) 
      }
    })
  },
};
