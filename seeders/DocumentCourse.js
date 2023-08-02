module.exports = async ()=>{
        let documentCourses = []
        let courses= await Course.findAll()
        courses.forEach((element,index) => {
            for(let i=0;i<10;i++){
                documentCourses.push({
                    name:element.name+i+"number "+i,
                    description:index+" Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi ea a odit tempore obcaecati delectus eveniet itaque, explicabo cumque odio eos dolorem saepe iste alias possimus repellat nihil quas voluptates.",
                    rating:0,
                    parent:element.id
                })
            }
        });
        return await CoursDocument.bulkCreate(documentCourses)


}