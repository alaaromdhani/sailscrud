/**
 * Api/PaymentController.js
 *
 * @description :: Server-side logic for managing payment endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const sequelize = require('sequelize')
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const resolveError = require("../../utils/errors/resolveError");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { PaymentShema } = require("../../utils/validations/PaymentSchema");


module.exports = {
  async create(req, res) {
    try{
       const bodyValidation = schemaValidation(PaymentShema)(req.body)
       if(bodyValidation.isValid){
        req.body.addedBy= req.user.id
        return DataHandlor(req,await Payment.create(req.body),res)
       }
       else{
        throw new ValidationError({message:bodyValidation.message})
      } 
    }catch(e){
      return ErrorHandlor(req,resolveError(e),res)
    }
  },

  async find(req, res) {
    try {
      const {seller_id,debutDate,endDate} = req.query
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
  

      // Create the filter conditions based on the search query
      let  where = {

      };
      if(seller_id){
          where.seller_id = seller_id
      }  
      if(debutDate){
        where.createdAt = {[sequelize.Op.and]:[
          sequelize.where(sequelize.fn('date',sequelize.col('Payment.createdAt')),{
            [sequelize.Op.gte]:debutDate
          }),
          sequelize.where(sequelize.fn('date',sequelize.col('Payment.createdAt')),{
            [sequelize.Op.lte]:debutDate
          })

        ]}
      }
      
      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Payment.findAndCountAll({
        where,
        order,
        include:[{
          model:Seller,
          foreignKey:'seller_id',
          attributes:['name']
        },{
          model:User,
          foreignKey:'addedBy',
          attributes:['firstName','lastName'],
          as:'Adder'
        },{
          model:User,
          foreignKey:'updatedBy',
          attributes:['firstName','lastName'],
          as:'Updater'
        }],
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
      const data = await Payment.findByPk(req.params.id);
      if (!data) {
       return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
      try{
        return DataHandlor(req,await sails.services.sellerservice.updatePayment(req),res)
      }catch(e){
        return ErrorHandlor(req,resolveError(e),res)
      }
  },

  async destroy(req, res) {
    try{
      return DataHandlor(req,await sails.services.sellerservice.deletePayment(req),res)
    }catch(e){
      return ErrorHandlor(req,resolveError(e),res)
    }
  },
};
