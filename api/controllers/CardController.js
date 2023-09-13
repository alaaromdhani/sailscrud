/**
 * Api/CardController.js
 *
 * @description :: Server-side logic for managing card endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const resolveError = require("../../utils/errors/resolveError");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const generateCardCode = require("../../utils/generateCardCode");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { CreateCardShema } = require("../../utils/validations/CardSchema");


module.exports = {
  
  async create (req, res) {
     const bodyValidation   = schemaValidation(CreateCardShema)(req.body)
     try{
      if(bodyValidation.isValid){
        let madarpack =  await PrepaidCard.findOne({where:{pack_id:null}})
         if(!madarpack){
           madarpack = await sails.services.payementservice.createDefaultSerie(req)
         }
         
         let [card,created] =await Card.findOrCreate({where:{
          serie_id:madarpack.id?madarpack.id:madarpack.dataValues.id,
          livraison_id:req.body.livraison_id
         
         },defaults:{
          serie_id:madarpack.id?madarpack.id:madarpack.dataValues.id,
          code:generateCardCode(3),
          addedBy:req.user.id,
          livraison_id:req.body.livraison_id
         }})
          return DataHandlor(req,card,res) 
        }
        else{
          throw new ValidationError({message:bodyValidation.message})
        }
         
     } catch(e){
      return ErrorHandlor(req,resolveError(e),res)
     }
  },
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
        include:[{
          model:Order,
          foreignKey:'order_id',
          attributes:['code'],
          include:{
            model:User,
            foreignKey:'addedBy',
            attributes:['firstName','lastName']
          }
        },
        {
          model:Livraison,
          foreignKey:'livraison_id',
          attributes:['addedBy'],
          include:{
            model:User,
            foreignKey:'addedBy',
            attributes:['firstName','lastName']
          }
        },{
          model:PrepaidCard,
          foreignKey:'serie_id',
          attributes:['name'],
          include:{
            model:Pack,
            foreignKey:'pack_id',
            attributes:['name']
          }
        }],
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
