const jwt = require("jsonwebtoken");
const User = require("../models/user")

const userAuth = async(req, res, next) => {
    //Read the token from the request cookies
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).send("Please login")
        }

        const decodedObj = await jwt.verify(token, "dev@tinder$790")
        
        const {_id} = decodedObj;

        const user = await User.findById(_id);
        if(!user){
            throw new Error("User not found")
        }

        req.user = user;
        next();//this will make the respective function in which it is passed to continue the remaining function
    }
    catch(err){
        res.status(400).send("Error" + err.message);
    }
    //Find the user

}

module.exports = {
    userAuth
};