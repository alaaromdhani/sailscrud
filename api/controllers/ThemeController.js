/**
 * Api/ThemeController.js
 *
 * @description :: Server-side logic for managing theme endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const schemaValidation = require('../../utils/validations')
const {ThemeShema} = require('../../utils/validations/ThemeSchema');
const {ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors')
const RecorNotFoundError = require('../../utils/errors/recordNotFound');

module.exports = {
  async create(req, res) {
    const createThemeSchema =schemaValidation(ThemeShema)(req.body)
    if(createThemeSchema.isValid){
      try {
        let body = req.body
        body.addedBy = req.user.id
        const data = await Theme.create(body);
        return DataHandlor(req,data,res);
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:createThemeSchema.message}))
    }
  },
  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder


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
      /*const permission = req.user.Permissions.filter(p=>p.Model.name===req.model && p.action==='update').at(0)
      if(!permission){
        where.isDeleted=false
      }*/
      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Theme.findAndCountAll({
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
      return ErrorHandlor(req,new SqlError(error),res); ;
    }
  },

  async findOne(req, res) {
    try {
      const data = await Theme.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecorNotFoundError(),res);;
      }
        return  DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new RecorNotFoundError(),res);
    }
  },

  async update(req, res) {
    sails.services.coachingvideosservice.updateTheme(req,(err,data)=>{
      if(err){
        ErrorHandlor(req,err,res);
      }else{
        DataHandlor(req,data,res);
      }
    });
  },

  async destroy(req, res) {
    sails.services.coachingvideosservice.deleteTheme(req,(err,data)=>{
      if(err){
        ErrorHandlor(req,err,res);
      }else{
        DataHandlor(req,data,res);
      }
    });
  },
};
