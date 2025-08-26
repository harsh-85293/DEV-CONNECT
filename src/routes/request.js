const express = require("express")
const requestRouter = express.Router();
const {userAuth} = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user")

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;      
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignore", "interested"]

        //issues with status types
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message : "invalid status type " + status})
        }

        const toUser = await User.findById(toUserId)
        if(!toUser){
            return res.status(404).json({
                message : "User not found"
            })
        }

        //if there is am existing connection request
        const existingconnectionRequest = await ConnectionRequest.findOne({
            $or : [
                {fromUserId : fromUserId, toUserId : toUserId},
                {fromUserId : toUserId, toUserId : fromUserId}
            ]
        })
        if(existingconnectionRequest){
            return res.
                   status(400).
                   send({message : "connection request already present"})
        }
        
        const connectionrequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        })

        const data = await connectionrequest.save();//it will save it into the database 
        res.json({
            message : req.user.firstName + "is " +  status + " in " + toUser.firstName,
            data
        })
    } 
    catch (err) {
        res.status(400).send("Error + " + err.message)    
    } 
    
})

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {

    //Writing logic for review Api
    try {
        const loggedinUser = req.user;
        const allowedStatus = ["accepted", "rejected"]
        const {status, requestId} = req.params; 
        
        if(!allowedStatus.includes(status)){
            return res.status(400).json({ message : "Status not allowed!"})
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id : requestId,
            toUserId : loggedinUser._id,
            status : "interested"
        })

        if(!connectionRequest){
            return res.status(404).json({ message : "connection request not found!"})
        }

        connectionRequest.status = status;

        // ✅ minimal fix: save and return the updated doc (remove undefined `data`)
        const data = await connectionRequest.save();
        res.json({ message: "Connection Request " + status, data })

        //Validate the status
        

        //Akshay => Elon
        //is Elon logged in (loggedinid = userid)
        //status => interested
        //requestid should be valid

    } 
    catch (err) {
        res.status(400).send("Error + " + err.message)    
    } 
})

module.exports = requestRouter;
