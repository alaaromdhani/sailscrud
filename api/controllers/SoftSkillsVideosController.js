/**
 * Api/SoftSkillsVideosController.js
 *
 * @description :: Server-side logic for managing soft_skills_videos endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const schemaValidation = require("../../utils/validations");


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
      const attributes = Object.keys(SoftSkillsVideos.sequelize.models.SoftSkillsVideos.rawAttributes);


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
      const { count, rows } = await SoftSkillsVideos.findAndCountAll({
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
      const data = await SoftSkillsVideos.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'SoftSkillsVideos not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const data = await SoftSkillsVideos.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'SoftSkillsVideos not found' });
      }
      const updatedSoftSkillsVideos = await data.update(req.body);
      return res.json(updatedSoftSkillsVideos);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async destroy(req, res) {
    try {
      const data = await SoftSkillsVideos.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'SoftSkillsVideos not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
