/**
 * Api/CoursVideoController.js
 *
 * @description :: Server-side logic for managing cours_video endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { CoursVideoShema } = require("../../utils/validations/CoursvideoSchema");
const RateShema = require("../../utils/validations/RateSchema");


module.exports = {
  async create(req, res) {
      const createVideoCourseValidation = schemaValidation(CoursVideoShema)(req.body)
      if(createVideoCourseValidation.isValid){
        try {
          let c  = req.body
          c.rating=0
          c.addedBy = req.user.id
          return DataHandlor(req,await CoursVideo.create(c),res)
        } catch (err) {
          return ErrorHandlor(req,new SqlError(err),res);
        }
      }
      else{
        return ErrorHandlor(req,new ValidationError({message:createVideoCourseValidation.message}),res)
      }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(CoursVideo.sequelize.models.CoursVideo.rawAttributes);


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
      const { count, rows } = await CoursVideo.findAndCountAll({
        where,
        include:{
          model:CoursComment,
          foreignKey:'c_video_id',
          include:{
             model:User,
             foreignKey:'addedBy',
             attributes:['username','lastName','firstName','email','profilePicture'] 
          }
        },
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
      const data = await CoursVideo.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  update(req, res) {
    sails.services.subcourseservice.updateVideoCourse(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
    })
  },
 destroy(req, res) {
    sails.services.subcourseservice.deleteVideoCourse(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
    })
  },
  async rateCourse(req,res){
    try {
      const course = await CoursVideo.findByPk(req.params.id,{
        include:{
          model:Course,
          foreignKey:'parent'
        }
      })
      if (course) {

        const rateCourseSchema = schemaValidation(RateShema)(req.body)
              if (rateCourseSchema.isValid) {
                  try{
                    let [rate, created] = await Rate.findOrCreate({
                      where: {
                        ratedBy: req.user.id,
                        c_video_id: req.params.id,
                        course_id:course.parent
                      }, defaults: {
                        ratedBy: req.user.id,
                        c_video_id: req.params.id,
                        course_id:course.parent,
                        rating: req.body.rating
                      }
                    })
                    if (!created) {
                      rate.rating = req.body.rating
                      await rate.save()
                    }
                    const subCourseratesCount = await Rate.findAll({
                      where: {
                        c_video_id: req.params.id
                      },
                      attributes: [
                        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                      ]
                    })
                    const parentCourseratesCount = await Rate.findAll({
                      where: {
                        course_id: course.parent
                      },
                      attributes: [
                        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                      ]
                    })
                    const parentCourse =course.Course 
                   
                      parentCourse.rating = parentCourseratesCount[0].dataValues.avgRating
                      course.rating = subCourseratesCount[0].dataValues.avgRating
                      await parentCourse.save()
                      return DataHandlor(req, await course.save(), res)
                  }catch(e){
                    return ErrorHandlor(req,new SqlError(e),res)
                  }
                
                } else {
                  return ErrorHandlor(req, new ValidationError({message: rateCourseSchema.message}), res)
                }
      } else {
        return ErrorHandlor(req, new RecordNotFoundErr(), res)
      }
    }
    catch(e){
      console.log(e)
      return ErrorHandlor(req,new SqlError(e),res)
    }

  },
  commentCourse:(req,res)=>{
    sails.services.subcourseservice.commentSubCourse(req,"video",(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })


  }
  
};
