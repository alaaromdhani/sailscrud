var _ = require('@sailshq/lodash');

module.exports = {

  /**
   * @param req
   */
  buildCallbackNextUrl: function (req) {
    var url = req.query.next;
    var includeToken = req.query.includeToken;
    var accessToken = _.get(req, 'session.tokens.accessToken');

    if (includeToken && accessToken) {
      return url + '?access_token=' + accessToken;
    }
    else {
      return url;
    }
  },

  /**
   * Lookup user by username or email.
   *
   * @param query.username
   * @param query.email
   * @param callback
   * @returns {*}
   */
  findUser: function (query, callback,err) {
    // force active status check
    
    // try to find user
    if (callback && err) {
      return User.findOne(query).then(callback).catch(err);
    } else {
      return User.findOne(query);
    }
  }

};
