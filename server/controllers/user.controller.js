import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary  from "cloudinary";
import fs from 'fs/promises'
import sendEmail from "../utils/sendEmail.js";


const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

//*********************************User registration handler==================================
const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;
    console.log(fullName, email, password, );
  // Check if required fields are provided
  if (!fullName || !email || !password) {
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

//==================================== Login handler (To be implemented)====================================//
const login = async (req, res, next) => {
  // Implement your login logic here
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.comparePassword(password)) {
    return next(new AppError("Email or password does not match"));
  }

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
    // res.status(500).json({
    //   success:false,
    //   message: error.message,
    // })
  }
};


const forgotPassword = async (req,res,next) => {
    
  const { email } = req.body

  if(!email) {
    return next(new AppError("Email is required", 400))
  }

  const user = await User.findOne({email});

  if(!user){
    return next(new AppError("Email not registerd", 400))
  }

  const resetToken = await user.generatePasswordResetToken();


  await user.save()

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail(email , subject , message);

    res.status(200).json({
      success: true,
      message: ` Reset  password token has been sent to ${email} successfully`
    })
  } catch (error) {

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToke = undefined;

    await user.save();
    return next(new AppError("Email not registerd", 400))
  }



}

const resetPassword = () => {



}

export { 
  register,
   login, 
   logout, 
   getProfile, 
   forgotPassword,
   resetPassword
   };
