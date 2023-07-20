const {
    DataTypes, Op 
  } = require('sequelize'); 
const ValidationError = require('../../utils/errors/validationErrors');
  var EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
  let phoneregex = /^(\+|\d{1,3})\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'subscribers',
      hooks:{
            beforeSave:(subscriber,options)=>{
                if(EMAIL_REGEX.test(subscriber.identifier)){
                    subscriber.isIdentifiedByemail=true
                }
                else if(phoneregex.test(subscriber.identifier)){
                    subscriber.isIdentifiedByemail=false
                }
                else{
                    throw new ValidationError({message:'email or phonenumber is required'})
                }
            }


      }  
    },
    datastore: 'default',
    tableName: 'subscribers',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        isIdentifiedByemail:{
            type:DataTypes.BOOLEAN,
            allowNull:true
        },
        identifier:{
            type:DataTypes.STRING,
            allowNull:true
        }

        
      
        
        
     
      
      
    },
    
        
     
    
    
    associations : function(){
     
       
       
       
      

        
     

  
    }
  };
  