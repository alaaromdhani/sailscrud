/**
 * Api/CardController.js
 *
 * @description :: Server-side logic for managing card endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");


module.exports = {
  

  async find(req, res) {
    try {
      const serie_id =req.query.serie_id 
      if(!serie_id){
        return ErrorHandlor(req,new ValidationError('serie_id is required'),res)
      }
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Card.sequelize.models.Card.rawAttributes);


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
        where = {
          ...where,
          serie_id
        }

      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Card.findAndCountAll({
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
      const data = await Card.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    return sails.services.paymentservice.updateCard(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }

    })
  },

  async destroy(req, res) {
    return sails.services.paymentservice.deleteCard(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }

    })
  },
};
