module.exports=async()=>{

    const defaultUpload = {
        file_original_name:'default.png',
        isPublic:true,
        file_name:sails.config.custom.dafault_user_image.file_name,
        path:sails.config.custom.dafault_user_image.path,
        extension:sails.config.custom.dafault_user_image.extension,
        type:'images',
        size:123//dummy size
    }
    const defaultFemaleAvatarUpload = {
        file_original_name:'default.png',
        isPublic:true,
        file_name:sails.config.custom.default_female_image.file_name,
        path:sails.config.custom.default_female_image.path,
        extension:sails.config.custom.default_female_image.extension,
        type:'images',
        size:123//dummy size
    }
    await Upload.findOrCreate({where:{file_name:sails.config.custom.dafault_user_image.file_name},defaults:defaultUpload})
    await Upload.findOrCreate({where:{file_name:sails.config.custom.default_female_image.file_name},defaults:defaultFemaleAvatarUpload})
    await User.update({profilePicture:sails.config.custom.baseUrl+sails.config.custom.files.routes.public+sails.config.custom.default_female_image.file_name},{
        where:{
           sex:'F' 
        }
    })
    //  Upload.create(defaultUpload)   


    


}