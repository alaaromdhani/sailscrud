/**
 * Api/BlogController.js
 *
 * @description :: Server-side logic for managing blog endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
const { ErrorHandlor, DataHandlor } = require('../../utils/translateResponseMessage');
const schemaValidation = require('../../utils/validations');
const { BlogShema } = require('../../utils/validations/BlogSchema');


module.exports = {
  async create (req, res) {
    console.log('am here')

    //  return DataHandlor(req,req.files,res)


    let currentUploads=[];
    if(req.operation){

      if(req.operation.files){

        try{
          console.log('opeartion files',req.operation.files)
          currentUploads = await Upload.bulkCreate(req.operation.files,{
            individualHooks:true
          });
          let blog = req.blog
          if(currentUploads.at(0)){
            if(Object.keys(req.files)[0]==='mi'){
              blog.meta_img = currentUploads.at(0).id
            }
            else{
              blog.banner = currentUploads.at(0).id
            }
          }
          if(currentUploads.at(1)){
            if(Object.keys(req.files)[1]==='mi'){
              blog.meta_img = currentUploads.at(1).id
            }
            else{
              blog.banner = currentUploads.at(1).id
            }
          }
          delete (req.operation)
          delete (req.blog)
          delete(req.upload)
          return DataHandlor(req,await blog.save(),res)

        }
        catch(e){
          console.log(e)
          return ErrorHandlor(req,new SqlError(e),res);
        }


      }
      else if(req.operation.error){
        return ErrorHandlor(req,req.operation.error,res);
      }
      else{
        return ErrorHandlor(req,new ValidationError({message: 'an input with type image is required'}),res);
      }

    }

    else{
      sails.services.blogservice.createBlog(req,async (err,data)=>{

        if(err){
          return ErrorHandlor(req,err,res);
        }
        else{
          try {
            DataHandlor(req,await Blog.create(data),res);
          }catch(e){
            return ErrorHandlor(req,new SqlError(e),res);
          }
        }
      });
    }



  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Blog.sequelize.models.Blog.rawAttributes);


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
      const { count, rows } = await Blog.findAndCountAll({
        include:[{
          model:BlogCategory,
          foreignKey:'category_id',
          attributes:['category_name']
        },{
          model:Upload,
          foreignKey:'banner',
          as:'Banner'
        },
        {
          model:Upload,
          foreignKey:'meta_img',
          as:'MetaImage'
        }],
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
      const data = await Blog.findByPk(req.params.id,{include:{
        model:BlogCategory,
        foreignKey:'category_id',

      }});
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    sails.services.blogservice.update(req,(err,data)=>{
      if(err){
        ErrorHandlor(req,err,res);
      }else{
        DataHandlor(req,data,res);
      }


    });
  },

  async destroy(req, res) {
    sails.blogservice.delete(req,(err,data)=>{
      if(err){
        ErrorHandlor(req,err,res);
      }else{
        DataHandlor(req,data,res);
      }


    });
  },
};
