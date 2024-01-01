import { Router } from 'express'
import { CreateCourse, addLectureToCourseById, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../controllers/course.controller.js'
import { authrizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/multer.middleware.js'

const router = Router()

router.route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authrizedRoles('ADMIN'),
        upload.single('thumbnail'),
         CreateCourse
         )
    

router.route('/:id')
       .get( isLoggedIn,
         getLecturesByCourseId 
         )
       .put(
        isLoggedIn,
        authrizedRoles('ADMIN'),
        updateCourse
        )
       .delete(
        isLoggedIn,
        authrizedRoles('ADMIN'),
        removeCourse
        )
        .post(
            isLoggedIn,
            authrizedRoles('ADMIN'),
            upload.single('thumbnail'),
            addLectureToCourseById
        )

export default router