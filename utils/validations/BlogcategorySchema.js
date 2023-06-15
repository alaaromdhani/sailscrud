const joi = require('joi')
const BlogcategoryShema = joi.object({
    
    category_name: joi.string().required(),
    
    slug: joi.string().required(),
    
})
const UpdateBlogcategoryShema = joi.object({
    
    category_name: joi.string(),
    
    slug: joi.string(),
    
})
module.exports = {BlogcategoryShema,UpdateBlogcategoryShema}
