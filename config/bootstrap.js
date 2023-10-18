/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */
const _ = require('@sailshq/lodash')
const permissionSeeders = require('../utils/seeders/permission');
const featureSeeders = require('../utils/seeders/features')
const modelSeasers = require('../utils/seeders/model');


const roleSeeders = require('../utils/seeders/roles')
const userSeesers = require('../utils/seeders/user');
const countrySeeders = require('../utils/seeders/country');
const stateSeeders = require('../utils/seeders/state');
const  nivauScolaireSeeders = require('../utils/seeders/niveauScoleaire');
const  matiereSeeders = require('../utils/seeders/matiere');
const  trimestresSeeders = require('../utils/seeders/trimestres');
const default_user_image = require('../seeders/defaultProfilePict');
const chaptersSeeders = require('../utils/seeders/chatpter')
const documentSeeders = require('../seeders/DocumentCourse')
const usersSeeders = require('../seeders/users')
const settingsSeeders = require('../seeders/settings')
const anneeScolaireSeeders = require('../utils/seeders/AnneeScolaire');
const pay_config = require('../utils/seeders/pay_config');
const groupSeeders = require('../utils/errors/groupSeeders');
const othersseerders = require('../utils/seeders/othersseerders');
const packseeders = require('../utils/seeders/packs')
const extraSeeders = require('../utils/seeders/extra')
module.exports.bootstrap = async function() {
  /*function getAllKeys(object){
    Object.keys(object).forEach(k=>{
      console.log(k)
      if(typeof(object[k]=='object' && typeof(k)=='string' && k.length>5)){
        getAllKeys(object[k])

      }
    })



   await featureSeeders()
  }*/
  //let message =sails.hooks.http.app.hasOwnProperty('static')?'it has its own static method':'it does not have its own static method'
  console.log(Object.keys(sails.hooks.http.app))

 try{
  await default_user_image()
  await modelSeasers()

   await countrySeeders()
   await stateSeeders()

   await featureSeeders()
   await roleSeeders()

    await permissionSeeders()
    console.log('now user seaders')
   await userSeesers()
  await matiereSeeders()
  await trimestresSeeders()
  await chaptersSeeders()
  await settingsSeeders()
  await anneeScolaireSeeders()
  await pay_config()
  await groupSeeders()
  await othersseerders()
  await nivauScolaireSeeders()
  await packseeders()
  await extraSeeders()
  //await usersSeeders()
//  await documentSeeders()
 }
 catch(e){
  console.log(e)
 }




  /*import _ from 'lodash'
  exports.createModels = function () {
    sails.log.verbose('sails-hook-permissions: syncing waterline models');

    var models = _.compact(_.map(sails.models, function (model, name) {
      return model && model.globalId && model.identity && {
        name: model.globalId,
        identity: model.identity,
        attributes: _.omit(model.attributes, _.functions(model.attributes))
      };
    }));

    return Promise.all(_.map(models, function (model) {
      return sails.models.model.findOrCreate({ name: model.name }, model);
    }));
  };*/
  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return;
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```

};
