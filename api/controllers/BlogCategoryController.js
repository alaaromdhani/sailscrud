/**
 * Api/BlogCategoryController.js
 *
 * @description :: Server-side logic for managing blog_category endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { BlogcategoryShema } = require("../../utils/validations/BlogcategorySchema");


module.exports = {
  async create(req, res) {
    const createBlogCatgeorySchema = schemaValidation(BlogcategoryShema)
    const createBlogCatgeoryValidation = createBlogCatgeorySchema(req.body)
    if(createBlogCatgeoryValidation.isValid){
      try {
        req.body.addedBy = req.user.id
        const data = await BlogCategory.create(req.body);
        return DataHandlor(req,data,res);
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }

    }else{
        return ErrorHandlor(req,new ValidationError({message:createBlogCatgeoryValidation.message}),res)
    }

  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(BlogCategory.sequelize.models.BlogCategory.rawAttributes);


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
      const order = [[sortBy, sortOrder]];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await BlogCategory.findAndCountAll({
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
      return ErrorHandlor(req,new SqlError(error),res)
    }
  },

  async findOne(req, res) {
    try {
      const data = await BlogCategory.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }

  },

  async update(req, res) {
      sails.services.blogservice.updateBlogCategory(req,(err,data)=>{
          if(err){
              ErrorHandlor(req,err,res)

          }
          else{
            DataHandlor(req,data,res)
          }

      })

  },

  async destroy(req, res) {
      sails.services.blogservice.deleteBlogCategory(req,(err,data)=>{
          if(err){
              ErrorHandlor(req,err,res)
          }
          else{
            DataHandlor(req,data,res)
          }

      })
  },
};
