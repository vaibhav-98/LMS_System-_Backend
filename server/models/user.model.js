import { Schema,model } from "mongoose";

const userSchema = new Schema ({
  
    fullName : {
        type : 'String',
        required :[true , 'Name is required'],
        minLength: [5,"Name must be at least 5 Characters"],
        maxLength : [50,"Name should be less than 90 Chracter"],
        lowecase: true,
        trim:true 
    },
    email : {
        type : 'String',
        required :[true , 'emal is required'],
        lowecase: true,
        trim:true ,
        unique :true,
        match:[ /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/] 
    },
    password: {
        type : 'String',
        required :[true , 'Password is required'],
        minLength: [8,"Password must be at least 5 Characters"],
        select:false

    },
    avatar: {
        public_id: {
            type:'String'
        },
        secure_url: {
            type:'String'
        }
    },
    role: {
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER'

    },
    forgotPasswordToke: String,
    forgotPasswordExpiry:Date,


}, {timestamps:true});

const User = model('User',userSchema) //Define a Mongoose model named 'User' using the 'userSchema' schema


export default User
