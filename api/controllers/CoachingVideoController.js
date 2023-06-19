/**
 * Api/CoachingVideoController.js
 *
 * @description :: Server-side logic for managing coaching_video endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const schemaValidation = require('../../utils/validations');
const {CoachingVideoShema} = require('../../utils/validations/CoachingVideoSchema');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
const RecorNotFoundError = require('../../utils/errors/recordNotFound')

module.exports = {
  async create(req, res) {
          const createVideoSchema =schemaValidation(CoachingVideoShema)(req.body)
          if(createVideoSchema.isValid){
            try {
              let body = req.body
              body.addedBy = req.user.id
              const data = await CoachingVideo.create(body);
              return DataHandlor(req,data,res);
            } catch (err) {
              return ErrorHandlor(req,new SqlError(err),res);
            }
          }
          else{
            return ErrorHandlor(req,new ValidationError({message:createVideoSchema.message}))
          }
        }
  ,

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(CoachingVideo.sequelize.models.CoachingVideo.rawAttributes);


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
      const permission = req.user.Permissions.filter(p=>p.Model.name===req.model && p.action==='update').at(0)
      if(!permission){
        where.isDeleted=false
      }

      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await CoachingVideo.findAndCountAll({
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
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await CoachingVideo.findByPk(req.params.id);
      if (!data) {
       return ErrorHandlor(req,new RecorNotFoundError(),res);
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    sails.services.coachingvideosservice.update(req,(err,data)=>{
      if(err){
        ErrorHandlor(req,err,res);
      }else{
        DataHandlor(req,data,res);
      }
    });
  },

  async destroy(req, res) {
    sails.services.coachingvideosservice.deleteCoachingVideo(req,(err,data)=>{
      if(err){
        ErrorHandlor(req,err,res);
      }else{
        DataHandlor(req,data,res);
      }
    });
  },
};
