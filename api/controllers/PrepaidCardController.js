/**
 * Api/PrepaidCardController.js
 *
 * @description :: Server-side logic for managing prepaid_card endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const { Op } = require("sequelize");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const resolveError = require("../../utils/errors/resolveError");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { PrepaidcardShemaWithoutFile } = require("../../utils/validations/PrepaidcardSchema");


module.exports = {
  async create(req, res) {
    if(req.operation){
      if(req.operation.error){
          return ErrorHandlor(req,req.operation.error,res)
      }
      else{
          try{
            const photo =  await Upload.create(req.upload)
            const data = req.operation.data
            data.addedBy = req.user.id
            data.photo = photo.id
            await data.save()
            await sails.services.payementservice.createCards(data.id,data.nbre_cards,data.addedBy)  
      
            return DataHandlor(req,data,res)
          }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
          }

      }

  }
  else{
    try{
     
        if(req.body.pack_id){
          req.body.pack_id = parseInt(req.body.pack_id)
        }
        if(req.body.photo){
          req.body.photo = parseInt(req.body.photo)
        }
        if(req.body.nbre_cards){
          req.body.nbre_cards = parseInt(req.body.nbre_cards)
        }
        if(req.body.seller_id){
          req.body.seller_id = parseInt(req.body.seller_id)
        }
        const prepaidCardValidation = schemaValidation(PrepaidcardShemaWithoutFile)(req.body)
          let pack = req.body 
          pack.addedBy = req.user.id 
        if(prepaidCardValidation.isValid){
              let s = await PrepaidCard.create(pack)
              await sails.services.payementservice.createCards(s.id,s.nbre_cards,s.addedBy)  
      
              return DataHandlor(req,s,res) 
          }
          else{
            return ErrorHandlor(req,new ValidationError({message:prepaidCardValidation.message}),res)
          }

    }
    catch(e){
      return ErrorHandlor(req,new SqlError(e),res)
       
    }
  }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(PrepaidCard.sequelize.models.PrepaidCard.rawAttributes);


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
      const { count, rows } = await sails.models['prepaidcard'].findAndCountAll({
        where,
        include:[{
          model:Upload,
          foreignKey:'photo'
        },
        {
          model:Pack,
          foreignKey:'pack_id',
          attributes:['name']


        }
      ],
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
      console.log(error)
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await PrepaidCard.findByPk(req.params.id,{include:{
        model:Upload,
        foreignKey:'photo'
      }});
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    if(req.operation){
      if(req.operation.error){
          return ErrorHandlor(req,req.operation.error,res)
      }
      else{ 
          try{
            let data = req.operation.data
            data.photo = (await Upload.create(req.upload)).id
            
            return DataHandlor(req,await data.save(),res)
          }
          catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
          }
      }
    }
    else{
      console.log(req.body)
      if(req.body.price){
        req.body.price = parseFloat(req.body.price)
     }
     if(req.body.nbre_cards){
      req.body.nbre_cards = parseInt(req.body.nbre_cards)
    }
     if(req.body.duration){
        req.body.duration = parseInt(req.body.duration)
    }
    
    if(req.body.pack_id){
      req.body.pack_id = parseInt(req.body.pack_id)
    }
    if(req.body.photo){
      req.body.photo = parseInt(req.body.photo)
    }
    if(req.body.seller_id){
      req.body.seller_id = parseInt(req.body.seller_id)
    }
      sails.services.payementservice.updatemodel(req,(err,data)=>{
        if(err){
          
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
      })
    }
  },
  getPrepaidCardsBySeller:async (req,res)=>{
   try{
    const {seller_id} = req.params  
  
    const search = req.query.search
    const page = parseInt(req.query.page)+1 || 1;
    const limit = req.query.limit || 10;
    let where=search?{
      name:{
        [Op.like]:'%'+search+'%'
      }
    }:{seller_id}
    let {rows} = await PrepaidCard.findAndCountAll({where,
      attributes:['name'],
    include:{
      model:Card,
      attributes:['id'],
      foreignKey:'serie_id',
      where:{
        used:true
      },
      required:false
    },
    limit: parseInt(limit, 10),
    offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    })
    
    let count = rows.length
    return DataHandlor(req,{
      success: true,
      data: rows,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalCount: rows.length,
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    },res);
   }catch(e){
    console.log(e)
    return ErrorHandlor(req,resolveError(e),res)
   }
  },
  async destroy(req, res) {
    sails.services.payementservice.deleteModel(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
  })
  
  
  },
};
