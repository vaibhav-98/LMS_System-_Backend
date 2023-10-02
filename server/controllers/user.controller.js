import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary  from "cloudinary";
import fs from 'fs/promises'
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto'



const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

//********************************* User registration handler =====================================//
const register = async (req, res, next) => {
  const { fullName, email, password , role} = req.body;
    console.log(fullName, email, password,role );
  // Check if required fields are provided
  if (!fullName || !email || !password || !role) {
    return next(new AppError("All fields are required", 400));
  }

  // Check if a user with the provided email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError("Email already exists", 400));
  }

  // Create a new user
  const user = await User.create({
    fullName,
    email,
    password,
    role,
    avatar: {
      public_id: email,
      secure_url: "URL", // You may need to replace this with the actual URL.
    },
  });

  if (!user) {
    return next(
      new AppError("User registration failed. Please try again", 400)
    );
  }

  // TODO: File Upload - You can add code here for handling file uploads, if needed.
       
  console.log("File upload > " ,JSON.stringify(req.file));
   if(req.file) {
    try {
      const result =await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms',
        width:250,
        height:250,
        gravity:'faces',
        crop:'fill'
      });

      if(result){
        user.avatar.public_id =  result.public_id;
        user.avatar.secure_url =  result.secure_url

        //Remove file from server
         fs.rm(`uploads/${req.file.filename}`)


      }
    } catch (error) {
      return next(
        new AppError(error || 'File not uploaded , please try again',500)
      )
    }
   }
  // Save the user to the database
  await user.save();

  // Generate a JWT token for the user
  const token = await user.generateJWTToken();

  // Remove the password from the user object for security
  user.password = undefined;

  // Set the token as a cookie with the specified options
  res.cookie("token", token, cookieOptions);

  // Respond with a success message and the user data
  res.status(201).json({
    success: true,
    message: "User registration successfully",
    user,
  });
};

//==================================== Login handler (To be implemented)============================================//
const login = async (req, res, next) => {
  // Implement your login logic here
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");
    //console.log({user});
   
  if (!user || !user.comparePassword(password)) {
    return next(new AppError("Email or password does not match"));
  }
  console.log(`compare password `, (user.comparePassword(password)));

  const token = await user.generateJWTToken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "User loggedin successfully",
    user,
  });
};

//=========================================== Logout handler (To be implemented)======================================//
const logout = (req, res) => {
  // Implement your logout logic here

  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out succesfully",
  });
};

//====================================================Get user profile handler (To be implemented)============================//

// Implement your profile retrieval logic here

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: "User details",
      user
    });
  } catch (error) {
    return next(new AppError("Failed to fetch profile", 500));
    res.status(500).json({
      success:false,
      message: error.message,
    })
  }
};

//=========================================== forgotPassword ==============================================================//


const forgotPassword = async (req,res,next) => {
    
  const { email } = req.body

  if(!email) {
    return next(new AppError("Email is required", 400))
  }

  const user = await User.findOne({email});
  console.log({user});
  if(!user){
    return next(new AppError("Email not registerd", 400))
  }

  const resetToken = await user.generatePasswordResetToken();

// console.log("resetTokrn", resetToken);
  await user.save()

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  console.log(resetPasswordURL);

  const subject = 'Reset Password';
  const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;
  try {
    await sendEmail(email , subject , message);

    res.status(200).json({
      success: true,
      message: ` Reset  password token has been sent to ${email} successfully`
    })
  } catch (error) {

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();
    return next(new AppError("Email not registerd", 400))
  }



}
//======================================================= resetPassword =============================//


const resetPassword = async(req,res,next) => {
    
  const { resetToken } = req.params;

  const { password } = req.body;
   console.log( {resetToken , password });
 const forgotPasswordToken = crypto 
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

      if (!password) {
            return next(new AppError('Password is required', 400));
          }

     console.log(forgotPasswordToken);

  const user = await User.findOne({
    forgotPasswordToken,
     forgotPasswordExpiry: {$gt : Date.now()}
  });
  
  console.log(`user here ${user}`);

  if(!user){
       return next (
          new AppError('Token is invalid or expired,  please try again',400)
       )
     };

     user.password = password;
     user.forgotPasswordToken = undefined;
     user.forgotPasswordExpiry = undefined;

     user.save();

     res.status(200).json({
         success : true,
         message: 'Password changed successfully'
     })

}

//=============================changePassword=======================================

const changePassword = async (req,res) => {
    
  const {oldPassword, newPassword} = req.body;

  const { id } = req.user // Auth.js

  if( !oldPassword ||  !newPassword){
    return next (
      new AppError('All fields are mandatory',400)
   )
  }

  const user = User.findById(id).select('+password')
  //  console.log({ user });
  if(!user){
    return next (
      new AppError('User does not exist',400)
   )
  }
  const isPasswordValid = await user.comparePassword(oldPassword)
   
  if(!isPasswordValid){
    return next (
      new AppError('Invalid old password',400)
   )
  }

  user.password = newPassword

  await user.save()

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  })


}
//=============================== updateUser ===========================================================
const updateUser = async (req,res) => {
   const { fullName } = req.body;
   const { id } = req.user.id ; // Auth.js

   const user = await User.findById(id)

   if(!user){
    return next (
      new AppError('User does not exist',400)
   )
  }

  if(req.fullName) {
      user.fullName = fullName
  }

  if(req.file){
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
  }
  try {
    const result =await cloudinary.v2.uploader.upload(req.file.path,{
      folder:'lms',
      width:250,
      height:250,
      gravity:'faces',
      crop:'fill'
    });

    if(result){
      user.avatar.public_id =  result.public_id;
      user.avatar.secure_url =  result.secure_url

      //Remove file from server
       fs.rm(`uploads/${req.file.filename}`)


    }
  } catch (error) {
    return next(
      new AppError(error || 'File not uploaded , please try again',500)
    )
  }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'User details updated successfullyQ'
    })
 }




//======================================== export ================================================//
export { 
  register,
   login, 
   logout, 
   getProfile, 
   forgotPassword,
   resetPassword,
   changePassword,
   updateUser
   };

//jasn
