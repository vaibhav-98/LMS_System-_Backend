import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js";
import cloudinary  from "cloudinary";
import fs from 'fs/promises'

//======================================= Create Course ========================================================//

const CreateCourse = async (req, res, next) => {
        
    const {  title, description , category , createdBy} = req.body;

    if(! title || !description || !category || !createdBy) {
        return next (
            new AppError('All fiels are required',400 )
        ) 
    }
   
    const course = await Course.create ({
        title,
        description, 
        category,
        createdBy,
        thumbnail: {
            public_id: 'Dummy',
            secure_url: 'Dummy',
        }
    })

    if(!course) {
        return next (
            new AppError(' Course could not created,  please try again',400 )
        ) 
    }

    if(req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });
    
            if(result) {
                course.thumbnail.public_id =  result.public_id;
                course.thumbnail.secure_url = result.secure_url
            }
    
            fs.rm(`uploads/${req.file.filename}`)
        }
        
        catch (e){
            return next(
                new AppError(e.message, 500)
            )
        }
    }
       

    await course.save()

    res.status(200).json({

        success:true,
        message: 'Course created successfully',
        course,
    })


}


//==================== getAllCourses ==============================================//
const getAllCourses = async (req,res,next) => {
    const course  = await Course.find({}).select('-lectures')

    res.status(200).json({
        success:true,
        message: 'All courses',
        course,
    })

}
//=================================getLecturesByCourseId=========================//
const getLecturesByCourseId = async (req,res,next) => {
     try {
        const { id } = req.params;
        
        const course = await Course.findById(id);

        if(!course) {
            return next(
                new AppError('Invalid course id ', 400)
            )
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures,
        })
     } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
     }

}


//============================================= Update Course =====================================
const updateCourse = async (req,res,next) => {
      try {
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body,
            },
            {
                runValidators: true 
            },
            {
                new:true
            }
        );

         if(!course) {
            return next(
                new AppError('Course with given id does not exist', 400)
            )
         }

         res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
         })


      } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
      }

}

//================================================== Delete Course===================================//
const removeCourse = async (req,res,next) =>{
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if(!course) {
            return next(
                new AppError('Course with given id does not exist', 400)
            )
        }

        await Course.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message:'Course deleted successfully'
        })
    

    } catch (error) {
        return next(
            new AppError(error.message,500)
        )
    }
}

const addLectureToCourseById = async (req,res,next) =>{
    const { title , description } = req.body;
    const { id } = req.params;
      
    if(!title || !description) {
        return next(
            new AppError("All field are required",400)
        )
    }
    const course = await Course.findById(id);

    if(!course) {
        return next(
            new AppError("Course with given id does not  exist",400)
        )
    }
    
    const lectureData = {
        title,
        description
    };

    if(req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });
    
            if(result) {
                lectureData.thumbnail.public_id =  result.public_id;
                lectureData.thumbnail.secure_url = result.secure_url
            }
    
            fs.rm(`uploads/${req.file.filename}`)
        }
        
        catch (e){
            return next(
                new AppError(e.message, 500)
            )
        }
    };

    course.lectures.push(lectureData);

    course.numberOfLectures = course.lectures.length;

    await course.save()

    res.status(200).json({
        success: true,
        message:'Lecture successfully added to the course',
        course
    })
}
export {
    getAllCourses,
    getLecturesByCourseId,
    CreateCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById
}
//baxba