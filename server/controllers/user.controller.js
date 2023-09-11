import User from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

//*********************************User registration handler==================================
const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

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
    return next(new AppError("User registration failed. Please try again", 400));
  }

  // TODO: File Upload - You can add code here for handling file uploads, if needed.

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

//==================================== Login handler (To be implemented)
const login = async(req, res,next) => {
  // Implement your login logic here
  const { email , password} = req.body;

  if(!email || !password){
    return next(new AppError("All fields are required", 400));
  }

  const user = await User.findOne({email}).select('+password')

  if(!user || !user.comparePassword(password)){
    return next(new AppError('Email or password does not match'))
  }

  const token = await user.generateJWTToken();
  user.password = undefined;

  res.cookie('token', token , cookieOptions)

  res.status(200).json({
    success: true,
    message: 'User loggedin successfully',
    user,
  })


};

//=========================================== Logout handler (To be implemented)
const logout = (req, res) => {
  // Implement your logout logic here
};

// Get user profile handler (To be implemented)
const getProfile = (req, res) => {
  // Implement your profile retrieval logic here
};

export { register, login, logout, getProfile };
