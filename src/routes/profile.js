const express = require("express")
const profileRouter = express.Router();
const {userAuth} = require("../middlewares/auth")
const {validateEditProfile} = require("../utils/validation")

profileRouter.get("/profile/view", userAuth, async(req, res) => {
    try{  
        const user = req.user;
        res.send(user)
    }
    catch(error){
        res.status(400).send("Error" + error.message)
    }
    
})

profileRouter.patch("/profile/edit", userAuth, async(req, res) => {
    try{  
        if(!validateEditProfile(req)){
            throw new Error("Invalid edit request")
        }

        const loggedinUser = req.user;
        
        Object.keys(req.body).forEach((key) => (loggedinUser[key] = req.body[key]))
        
        await loggedinUser.save()

        res.json({message : `${loggedinUser.firstName}, your profile updated successfully`, data : loggedinUser})
    }
    catch(error){
        res.status(400).send("Error" + error.message)
    }
    
})

module.exports = profileRouter