/**
 * Api/OtherDocumentController.js
 *
 * @description :: Server-side logic for managing other_document endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const SqlError = require("../../utils/errors/sqlErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");


module.exports = {
  async create(req, res) {
    if(req.operation){
      if(req.operation.error){
        return ErrorHandlor(req,req.operation.error,res)
      }
      else{
          try{
            let model = req.operation.data
            model.document  = (await Upload.create(req.upload)).id
            return DataHandlor(req,await model.save(),res)
          } 
          catch(e){
              return ErrorHandlor(req,new SqlError(e),res)
          }
        /**/
      }
    }
    else{
      sails.services.otherservice.createOtherDocument(req,(err,data)=>{
        if(err){
         return ErrorHandlor(req,err,res)
        } 
        else{
         return DataHandlor(req,data,res)
        }
     })
    }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(OtherDocument.sequelize.models.OtherDocument.rawAttributes);


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
      const { count, rows } = await OtherDocument.findAndCountAll({
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
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await OtherDocument.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    if(req.operation){
      if(req.operation.error){
        return ErrorHandlor(req,req.operation.error,res)
      }
      else{
          try{
            let model = req.operation.data
            model.document  = (await Upload.create(req.upload)).id
            return DataHandlor(req,await model.save(),res)
          } 
          catch(e){
              return ErrorHandlor(req,new SqlError(e),res)
          }
        /**/
      }
    }
    else{
      sails.services.otherservice.updateOtherDocument(req,(err,data)=>{
        if(err){
         return ErrorHandlor(req,err,res)
        } 
        else{
         return DataHandlor(req,data,res)
        }
     })
    }
  },
  rateCourse:(req,res)=>{
      sails.services.otherservice.rateCourse(req,(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
      },type="document")
  },

  async destroy(req, res) {
    try {
      const data = await OtherDocument.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req, new RecordNotFoundErr(),res)
      }
      await data.destroy();
      return DataHandlor(req,{},res)
    } catch (err) {
      return ErrorHandlor(req, new SqlError(err),res)
    }
  },
};
