const joi = require('joi')
const BlogShema = joi.object({
    
    title: joi.string().required(),
    
    slug: joi.string().required(),
    
    short_description: joi.string().required(),
    
    description: joi.string().required(),
    
    banner: joi.number().integer(),
    
    meta_title: joi.string().required(),
    
    meta_description: joi.string().required(),
    
    meta_keywords: joi.string().required(),
    category_id:joi.number().integer().required(),
    meta_img:joi.number().integer(),
   
    
})
const UpdateBlogShema = joi.object({
    
    title: joi.string(),
    
    slug: joi.string(),
    
    short_description: joi.string(),
    
    description: joi.string(),
    
    banner: joi.number().integer(),
    
    meta_title: joi.string(),
    
    meta_description: joi.string(),
    
    meta_keywords: joi.string(),
    
    status: joi.boolean(),
    
})
module.exports = {BlogShema,UpdateBlogShema}
