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
    await Upload.findOrCreate({where:{file_name:sails.config.custom.dafault_user_image.file_name},defaults:defaultUpload})
   //  Upload.create(defaultUpload)   


    


}