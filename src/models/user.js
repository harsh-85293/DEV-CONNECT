const mongoose = require("mongoose")
const validator = require("validator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
    firstName : {
        type : String,
        required : true,
        minLength : 4,
        maxLength : 50,
        index:true,
    },
    lastName : {
        type : String
    },  
    emailId : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        validate(value){
            if(validator.isEmail(value) === false){
                throw new Error("Invalid email address " + value)
            }
        }
    },  
    password: {
        type : String,
        required : true,
        validate(value){
            if(value.length < 6){
                throw new Error("Password must be at least 6 characters long.");
            }
        }
    }, 
    age: {
        type : Number
    }, 
    gender : {
        type : String,
        enum : {
            values : ["male", "female", "others"],
            message : `{VALUE} is not a valid gender type` 
        },
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw new Error("Gender data not valid");
            }
        }
    },
    photoUrl : {
        type : String,
        default : "https://tse2.mm.bing.net/th/id/OIP.GDzD9q-sQFLKPcjBMUOBOQHaHa?pid=Api&P=0&h=220",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid photo url" + value)
            }
        }
    },
    about : {
        type : String,
        default : "This is a default about of the user"
    },
    skills : {
        type : [String]
    },
}, {
        timestamps : true,
    }
);

//User.find({firstName : "Rahul", lastName : "Dravid"})

//dont  do the below as it should not be in database as it ads load to it 
//it is tough for database to handle random indexes
//index is for lakhs of user and unique : true is also sufficient
// userSchema.index({firstName : 1})
// userSchema.index({gender : 1})

userSchema.methods.getJWT = function () {
  return jwt.sign(
    { _id: this._id.toString(), emailId: this.emailId },
    "dev@tinder$790",
    { expiresIn: "7d" }
  );
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  return await bcrypt.compare(passwordInputByUser, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;