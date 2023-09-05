import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js"

const register = async (req,res, next) => {
    const {fullName , email , password} = req.body

    if(! fullName || email || password) {
        return next(new AppError("All fields are required", 400))
    }

     const userExists = await User.findOne({email})

     if(userExists) {
        return next(new AppError("Email alredy exists" , 400))
     }

     const user =  await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id : email,
            secure_url : "URL",
        }
     })

     if(!user) {
        return next(new AppError('user registration faild, Please try again', 400))
     }

     // TODO : File Uplode

     await user.save()

     register.status(201).json({
        success: true,
        message: 'User registration successfully',
        user
     })

};

const login = (req,res) => {

}

const logout = (req,res) => {

}

const getProfile = (req,res) => {

}

export {
    register,
    login,
    logout,
    getProfile
}