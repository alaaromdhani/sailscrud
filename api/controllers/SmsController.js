/**
 * Api/SmsController.js
 *
 * @description :: Server-side logic for managing sms endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const UnkownError = require("../../utils/errors/UnknownError");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const SmsShema = require("../../utils/validations/SmsSchema");


module.exports = {
  async create(req, res) {
    const smsValidation = schemaValidation(SmsShema)(req.body)
    if(smsValidation.isValid){
      let messages = []
    let originBody = {
      content:req.body.content,
      type:"MARKETING",
      sender_id:req.user.id
    }
    if(req.body.subscriber){
      const s = req.body.subscriber
      if(typeof(s)=='number'){
        messages.push({
          ...originBody,
          subscriber_id:s
        })
      }
      else if(typeof(s)=='string' && s==="all"){
        messages.push({
          ...originBody,
        })
      }
    }
    if(req.body.reciever_id){
      messages.push({
        ...originBody,
        reciever_id:req.body.reciever_id
      })
    }
    if(req.body.group_id){
      messages.push({
        ...originBody,

        group_id:req.body.group_id
      })
    }
    if(!messages.length){
      return ErrorHandlor(req,new ValidationError({message:'valid sms is required'}))
    }
    
    try{
      return DataHandlor(req,await Sms.bulkCreate(messages,{
        individualHooks:true
      }),res)
    }
    catch(e){
        if(e instanceof UnkownError || e instanceof ValidationError){
          return ErrorHandlor(req,e,res)
        }
        else{
          return ErrorHandlor(req ,new SqlError(e),res)
        }
    }
    
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:smsValidation.message}),res)
    }
   
    
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Sms.sequelize.models.Sms.rawAttributes);


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
      const { count, rows } = await Sms.findAndCountAll({
        where,
        order,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      });

      return res.json({
        success: true,
        data: rows,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      });
    } catch (error) {
      return res.serverError(error);
    }
  },

  async findOne(req, res) {
    try {
      const data = await Sms.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Sms not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  
};
