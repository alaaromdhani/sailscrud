/**
 * Api/CourseController.js
 *
 * @description :: Server-side logic for managing course endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const Sequelize = require('sequelize')
const schemaValidation = require('../../utils/validations');
const {CourseShema} = require('../../utils/validations/CourseSchema');
const RateShema = require('../../utils/validations/RateSchema');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const recordNotfFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors');

module.exports = {
  async create(req, res) {
    const createCourseValidation = schemaValidation(CourseShema)(req.body)
    if(createCourseValidation.isValid){
      try {
        let  courseToCreate = req.body
        courseToCreate.addedBy = req.user.id
        courseToCreate.rating = 0
        const data = await Course.create(courseToCreate);
        return DataHandlor(req,data,res)
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:createCourseValidation.message}),res)
    }
    },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Course.sequelize.models.Course.rawAttributes);


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
      const { count, rows } = await Course.findAndCountAll({
        where,
        include:[{
          model:Matiere,
          foreignKey:'matiere_id',
          attributes:['name']
        },{
          model:NiveauScolaire,
          foreignKey:'niveau_scolaire_id',
          attributes:['name_fr','name_ar']
        },{
          model:Chapitre,
          foreignKey:'chapitre_id',
          attributes:['name']
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
      },res)
    } catch (error) {
      return ErrorHandlor(req,new SqlError(error),res)
    }
  },
  async rateCourse(req,res){
    try {
      const course = await Course.findByPk(req.params.id)
      if (course) {

        const rateCourseSchema = schemaValidation(RateShema)(req.body)
              if (rateCourseSchema.isValid) {
                let [rate, created] = await Rate.findOrCreate({
                  where: {
                    ratedBy: req.user.id,
                    course_id: req.params.id
                  }, defaults: {
                    ratedBy: req.user.id,
                    course_id: req.params.id,
                    rating: req.body.rating
                  }
                })

                if (!created) {
                  rate.rating = req.body.rating
                  await rate.save()
                }
                const ratesCount = await Rate.findAll({
                  where: {
                    course_id: req.params.id
                  },
                  attributes: [
                    [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                  ]

                })
                console.log(ratesCount)
                course.rating = ratesCount[0].dataValues.avgRating
                return DataHandlor(req, await course.save(), res)

                } else {
                  return ErrorHandlor(req, new ValidationError({message: rateCourseSchema.message}), res)
                }
      } else {
        return ErrorHandlor(req, new recordNotfFoundErr(), res)
      }
    }
    catch(e){
      console.log(e)
      return ErrorHandlor(req,new SqlError(e),res)
    }

  },

  async findOne(req, res) {
    try {
      const data = await Course.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new recordNotfFoundErr(),res)
      }
      return DataHandlor(req,data,res);
    } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    try {
      const data = await Course.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Course not found' });
      }
      const updatedCourse = await data.update(req.body);
      return res.json(updatedCourse);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async destroy(req, res) {
    try {
      const data = await Course.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Course not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
