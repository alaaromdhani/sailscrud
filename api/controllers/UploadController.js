/**
 * Api/UploadController.js
 *
 * @description :: Server-side logic for managing upload endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const path = require('path');
const { ErrorHandlor, DataHandlor } = require('../../utils/translateResponseMessage');
const schemaValidation = require('../../utils/validations');
const { updateUploadShema } = require('../../utils/validations/UploadSchema');
const ValidationError = require('../../utils/errors/validationErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const UnkownError = require('../../utils/errors/UnknownError');
const SqlError = require('../../utils/errors/sqlErrors');


module.exports = {
  create :async(req,res)=>{
    console.log(req.files)
    if(req.operation && req.operation.error){
    return   ErrorHandlor(req,req.operation.error,res);
    }
    else if(req.upload){
    return   DataHandlor(req,req.upload,res);
    }
    else{
      if(req.files && req.files.length){
        return ErrorHandlor(req,new UnkownError(),res)

      }
      return ErrorHandlor(req,new ValidationError({message:'the file is required'}),res);
    }
  },

  async find(req, res) {
    try {
      const type = req.query.type;
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Upload.sequelize.models.Upload.rawAttributes);


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
      if(type){
        where.type =type;

      }
      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Upload.findAndCountAll({
        include:{
          model:User,
          attributes:['firstName','lastName'],
          foreignKey:'addedBy'
        },
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
      const data = await Upload.findOne({where:{id:req.params.id}});
      if (!data) {
        return res.status(404).json({ error: 'Upload not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },



  async update(req, res) {
    const schema = schemaValidation(updateUploadShema)(req.body);
    if(schema.isValid){
      try {
        const data = await Upload.findByPk(req.params.id);
        if (!data) {
          return ErrorHandlor(req,new RecordNotFoundErr(),res);
        }
        const updatedUpload = await data.update(req.body);
        if(req.body.isDeleted){
          await User.update({profilePicture:sails.config.custom.baseUrl+sails.config.custom.files.routes.public+sails.config.custom.dafault_user_image.file_name},{where:{profilePicture:updatedUpload.link}});
        }
        return DataHandlor(req,updatedUpload,res);
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }

    }
    else{
      return ErrorHandlor(req,new ValidationError({message:schema.message}),res);

    }

    /*try {
      const data = await Upload.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Upload not found' });
      }
      const updatedUpload = await data.update(req.body);
      return res.json(updatedUpload);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }*/
  },

  async destroy(req, res) {
    try {
      const data = await Upload.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Upload not found' });
      }
      await data.destroy();
      return DataHandlor(req,{},res)
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
