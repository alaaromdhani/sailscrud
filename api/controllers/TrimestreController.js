/**
 * Api/TrimestreController.js
 *
 * @description :: Server-side logic for managing trimestre endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const schemaValidation = require('../../utils/validations');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
const recordNotFoundErr = require('../../utils/errors/recordNotFound');
const {TrimestreShema, UpdateTrimestreShema} = require('../../utils/validations/TrimestreSchema');
const recordNotfFoundErr = require('../../utils/errors/recordNotFound');
module.exports = {
  async create(req,res){
    const createTrimestreValidation = schemaValidation(TrimestreShema)(req.body)
    if(createTrimestreValidation.isValid){
      try {
        let  courseToCreate = req.body
        const data = await Trimestre.create(courseToCreate);
        return DataHandlor(req,data,res)
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:createTrimestreValidation.message}),res)
    }
  },
  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Trimestre.sequelize.models.Trimestre.rawAttributes);


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
      const order = [[sortBy, sortOrder]];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Trimestre.findAndCountAll({
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
      return ErrorHandlor(req,new SQLError(error),res);
    }
  },
  async findOne(req, res) {
    try {
      const data = await Trimestre.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new recordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },
  async update(req, res) {
    const updateTrimestre = schemaValidation(UpdateTrimestreShema)(req.body)
      if(updateTrimestre.isValid){
        try {
          const data = await Trimestre.findByPk(req.params.id);
          if (!data) {
            return ErrorHandlor(req,new recordNotfFoundErr(),res)
          }
          const updatedCourse = await data.update(req.body);
          return DataHandlor(req,updatedCourse,res);
        } catch (err) {
          return ErrorHandlor(req,new SqlError(err),res);
        }
      }
      else{
          return ErrorHandlor(req,new ValidationError({message:updateTrimestre.message}))
      }
  },

  async destroy(req, res) {
    try {
      const data = await Trimestre.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new recordNotfFoundErr(),res)
      }
      await data.destroy();
      return DataHandlor(req, {},res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },



};
