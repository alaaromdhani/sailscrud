/**
 * Api/OrderController.js
 *
 * @description :: Server-side logic for managing order endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const { Op } = require("sequelize");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");



module.exports = {


  async find(req, res) {
    try {
      const {status,payment_type,pack_id,} = req.query
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Order.sequelize.models.Order.rawAttributes);


      // Create the filter conditions based on the search query
      let where ={}
      let wherePack = {}
      let whereUser = {}
      if(pack_id){
        wherePack.id = pack_id
      }
      console.log(wherePack)
      if(search){
        whereUser = {
          firstName:{[Op.like]:'%'+search+'%'}
        }
      }
      if(status){
        where.status = status
      }
      if(payment_type){
        where.payment_type_id = payment_type
      }        
      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Order.findAndCountAll({
        where,
        include:[{
          model:User,
          foreignKey:'addedBy',
          attributes:['firstName','lastName'],
          where:whereUser,
          required:true,

        },
        {
          model:Pack,
          through:'orders_packs',
          attributes:['id','name'],
          where:wherePack,
          required:true,
        },],
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
        totalPages: Math.ceil(rows.length / parseInt(limit, 10)),
      },res);
    } catch (error) {
     return ErrorHandlor(req,new SqlError(error),res)
    }
  },

  async findOne(req, res) {
    try {
      const data = await Order.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res);
    } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    try {
      const data = await Order.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      const updatedOrder = await data.update(req.body);
      return DataHandlor(req,updatedOrder,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  
};
