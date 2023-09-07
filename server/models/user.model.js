import { Schema,model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

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

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10) 
})

userSchema.methods={
    generateJWTToken: async function() {
        return await jwt.sign(
            {id:this._id , email: this.email , subscription:this.subscription, role: this.role},
            process.env.JWT_SECRET,
            {
                expiresIn : '10m'
            }
        )
    }
}

const User = model('testUser',userSchema) // Define a Mongoose model named 'User' using the 'userSchema' schema


export default User
