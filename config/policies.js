/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  '*':['lang','passport','role','tokenVerifier','permissions'],
  AuthController:{
    '*':['lang','passport','role'],
    logout:['lang','passport','role','tokenVerifier'],
    profileCallback:['lang','passport','role','tokenVerifier'],
    profileUpdater:['lang','passport','role','tokenVerifier','ppUploader'],

  },
  BlogController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','permissions','blogfileUploader']
  },
  UploadController:{
    '*':['lang','passport','role','tokenVerifier','permissions'],
    'create':['lang','passport','role','tokenVerifier','fileUpload']
  },
  AssetsController:{
    streamPublicFile:['lang','passport','role'],
    streamPrivateFile:['lang','passport','role','tokenVerifier'],

  }


  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};
