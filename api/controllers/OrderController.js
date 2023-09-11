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
const { array } = require("joi");



module.exports = {


  async find(req, res) {
    try {
      const {status,payment_type,pack_id,niveau_scolaire_id} = req.query
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
      let whereNs = {}
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
      if(niveau_scolaire_id){
        whereNs = {niveau_scolaire_id}
      }        
      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      let { count, rows } = await Order.findAndCountAll({
        where,
        include:[{
          model:User,
          foreignKey:'addedBy',
          attributes:['firstName','lastName'],
          where:whereUser,
          required:true,

        },
        {
          model:AnneeNiveauUser,
          foreignKey:'order_id',
          attributes:['niveau_scolaire_id'],
          include:{
            model:NiveauScolaire,
            attributes:['name_ar'],
            foreignKey:'niveau_scolaire_id'
          },
          where:whereNs,
          required:true,
          
        },

        {
          model:Pack,
          through:'orders_packs',
          attributes:['id','name'],
          where:wherePack,
          required:true,
        },
        ],
        order,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        distinct:true
      },);
    
      rows.forEach(r=>{
       
        r.dataValues['niveau_scolaires'] = Array.from(new Set(r.AnneeNiveauUsers.map(d=>JSON.stringify(d.dataValues)))).map(d=>JSON.parse(d))

      })
      return DataHandlor(req,{
        success: true,
        data: rows,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      },res);
    } catch (error) {
      console.log(error)
     return ErrorHandlor(req,new SqlError(error),res)
    }
  },

  async findOne(req, res) {
    try {
      const data = await Order.findByPk(req.params.id,{
        include:[{
            
            model:AnneeNiveauUser,
          
            foreignKey:'order_id',
            attributes:['type'],
            include:[{
                model:User,
                foreignKey:'user_id',
                attributes:['firstName','lastName']
            
            },{
                model:Trimestre,
                foreignKey:'trimestre_id',
                attributes:['name_ar','id']
             },{
                model:AnneeScolaire,
                foreignKey:'annee_scolaire_id',
                attributes:['startingYear','endingYear']
             },{
                model:NiveauScolaire,
                foreignKey:'niveau_scolaire_id',
                attributes:['name_ar']
             }],
            
        },{
            model:Pack,
            foreignKey:'pack_id',
            attributes:['name','nbTrimestres','price'],
            include:{
                model:Upload,
                foreignKey:'photo',
                attributes:['link']
            }
        } ,{
            model:User,
            foreignKey:'addedBy',
            attributes:['firstName','lastName','phonenumber'],
            include:[{
                model:Country,
                foreignKey:'country_id',
                attributes:['name']
            },{
                model:State,
                foreignKey:'state_id',
                attributes:['name']
            }]
         }]});
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
