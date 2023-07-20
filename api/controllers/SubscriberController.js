/**
 * Api/SubscriberController.js
 *
 * @description :: Server-side logic for managing Subscriber endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const {SubscriberShema,UpdateSubscriberShema} = require("../../utils/validations/SubscriberSchema");


module.exports = {
  async create(req, res) {
    const SubscriberValidation = schemaValidation(SubscriberShema)(req.body)
   if(SubscriberValidation.isValid){
    try {
      const data = await Subscriber.create(req.body);
      return DataHandlor(req,data,res)
    } catch (err) {
      
        return ErrorHandlor(req, new SqlError(err),res)
      
    }
   }
   else{
      return ErrorHandlor(req, new ValidationError({message:SubscriberValidation.message}),res)
   }
    
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Subscriber.sequelize.models.Subscriber.rawAttributes);


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
      const { count, rows } = await Subscriber.findAndCountAll({
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
      const data = await Subscriber.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    const updateSubscriberValidation = schemaValidation(UpdateSubscriberShema)(req.body)
    if(updateSubscriberValidation.isValid){
      try {
        const data = await Subscriber.findByPk(req.params.id);
        if (!data) {
          return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        const updatedSubscriber = await data.update(req.body);
        return DataHandlor(req,updatedSubscriber,res);
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:updateSubscriberValidation.message}),res)
    }
  },

  async destroy(req, res) {
    try {
      const data = await Subscriber.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      await data.destroy();
      return ErrorHandlor(req,{},res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },
};
