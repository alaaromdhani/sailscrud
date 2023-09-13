/**
 * Api/LivraisonController.js
 *
 * @description :: Server-side logic for managing livraison endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");


module.exports = {


  async find(req, res) {
    try {
      
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Livraison.sequelize.models.Livraison.rawAttributes);


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
      const { count, rows } = await Livraison.findAndCountAll({
        where,

        include:[{
          model:Adresse,
          foreignkey:'adresse_id'
        },{model:Order,foreignkey:'order_id',attributes:['code','priceAfterReduction']},

        {model:User,foreignkey:'addedBy',attributes:['firstName','lastName']}
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
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await Livraison.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res)      
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {

    
    /*try {
      const data = await Livraison.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Livraison not found' });
      }
      const updatedLivraison = await data.update(req.body);
      return res.json(updatedLivraison);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }*/
  },

  async destroy(req, res) {
    try {
      const data = await Livraison.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Livraison not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
