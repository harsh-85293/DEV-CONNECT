const express = require("express")
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth")
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest")

const usersafedata = "firstName lastName photoUrl age gender about skills"

//Get all pending connection request for the loggedin user
userRouter.get("/user/requests/received", userAuth, async(req, res) => {

    try {
        const loggedinUser = req.user;
        const ConnectionRequests = await ConnectionRequest.find({
            toUserId : loggedinUser._id,
            status : "interested"
        }).populate(
            "fromUserId", 
            ["firstName", "lastName"]
        )
        res.json({
            message : "Data fetched successfully",
            data : ConnectionRequests
            
        })
    } 
    catch (err) {
        res.status(400).send("Error: " + err.message)
    }
})

userRouter.get("/user/connections", userAuth, async(req, res) => {
    try {
        const loggedinUser = req.user;
        const ConnectionRequests = await ConnectionRequest.find({
            $or : [
                {toUserId : loggedinUser._id, status : "accepted"},
                {fromUserId : loggedinUser._id, status : "accepted"}
            ]
        }).populate("fromUserId", usersafedata)
          .populate("toUserId", usersafedata)
        
        const connections = ConnectionRequests.map((row) => {
            if(row.fromUserId._id.toString() === loggedinUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });
        
        res.json({
            message: "Connections fetched successfully",
            data: connections
        })
    } 
    catch (err) {
        res.status(400).send({message : err.message})
    }
})

userRouter.get("/feed", userAuth, async(req, res) => {
    try {
        //User should not see his own card
        //User should not see those cards which he has ignored
        //User should not see the card if he has already sent the connection request
        //User should not see cards of his own connections
        
        const loggedinUser = req.user;
        console.log("🔍 Backend - Logged in user:", loggedinUser._id);

        const pagenumber = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10
        limit = limit > 50 ? 50 : limit//sanitize the limit
        const skip = (pagenumber - 1)*limit
        
        //Find all connection requests involving the logged-in user
        const ConnectionRequests = await ConnectionRequest.find({
            $or : [
                {fromUserId : loggedinUser._id},
                {toUserId : loggedinUser._id},
            ]
        }).select("fromUserId toUserId status")

        const hiddenuserfromfeed = new Set();
        
        // Add logged-in user to hidden list (prevent self-showing)
        hiddenuserfromfeed.add(loggedinUser._id.toString());
        
        // Hide users the logged-in user has already interacted with
        ConnectionRequests.forEach( req=> {
            if (req.fromUserId.toString() === loggedinUser._id.toString()) {
                // Hide users this user has sent requests to
                hiddenuserfromfeed.add(req.toUserId.toString());
            } else {
                // Hide users who have sent requests to this user
                hiddenuserfromfeed.add(req.fromUserId.toString());
            }
        })
        console.log("🔍 Backend - Logged in user ID:", loggedinUser._id.toString());
        console.log("🔍 Backend - Hidden users:", Array.from(hiddenuserfromfeed));
        
        const users = await User.find({
            _id : { $nin : Array.from(hiddenuserfromfeed)}
        }).select(usersafedata).skip(skip).limit(limit)

        console.log("🔍 Backend - Found users count:", users.length);
        if(users.length > 0) {
            console.log("🔍 Backend - First user:", users[0]);
            console.log("🔍 Backend - First user firstName:", users[0].firstName);
            console.log("🔍 Backend - First user lastName:", users[0].lastName);
        }

        res.send(users)
    } 
    catch (err) {
        console.error("❌ Backend Feed Error:", err);
        res.status(400).json({message : err.message})
    }
})

// PATCH user API - updating the data of user
userRouter.patch("/user/:userId", userAuth, async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;

    try {
        const allowedUpdates = ["firstName", "lastName", "photoUrl", "about", "gender", "age", "skills"];
      
        const isAllowed = Object.keys(data).every(x => allowedUpdates.includes(x))
        
        if(!isAllowed){
            return res.status(400).json({message: "Update not allowed - invalid fields"});
        }
        
        if(data?.skills && data.skills.length > 10){
            return res.status(400).json({message: "Skills should not be more than 10"});
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            data,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        
        console.log("User updated successfully:", user);
        res.json({message: "User updated successfully", user});
    }
    catch (err) {
        console.error("User update error:", err);
        res.status(400).json({message: "Update failed: " + err.message});
    }
});

module.exports = userRouter























// // Feed API - get all the users from the database
// basicRouter.get("/feed", async (req, res) => {
//     try {
//         const users = await User.find({});
//         if (users.length === 0) {
//             res.send("No user found");
//         } else {
//             console.log(users);
//             res.send(users);
//         }
//     }
//     catch (err) {
//         res.status(400).send("Something went wrong");
//     }
// });

// // user API to find the single user by email
// basicRouter.get("/user", async (req, res) => {
//     // getting user from body
//     const userEmail = req.body.emailId;
//     try {
//         const user = await User.findOne({ emailId: userEmail });
//         if (!user) {
//             res.status(404).send("User not found");
//         } else {
//             res.send(user);
//         }
//     }
//     catch (err) {
//         res.status(400).send("Something went wrong");
//     }
// });

// basicRouter.delete("/user", async (req, res) => {
//     const userId = req.body.userId;

//     try {
//         const user = await User.findByIdAndDelete(userId);
//         if (!user) {
//             return res.status(404).send("User not found");
//         }
//         res.send("User deleted Successfully");
//     } 
//     catch (err) {
//         res.status(400).send("Something went wrong");
//     }
// });

// // patch user API - updating the data of user
// basicRouter.patch("/user/:userId", async (req, res) => {
//     const userId = req.params?.userId;
//     const data = req.body;

//     try {
//         const allowedUpdates  = ["userId","photoUrl", "about", "gender", "age"];
      
//         const isAllowed  = Object.keys(data).every(x => allowedUpdates.includes(k))
        
//         if(!isAllowed){
//           res.status(400).send("Update not allowed");
//         }
//         if(data?.skills.length > 10){
//             throw new Error("Skills should not be more than 10")
//         }
//         const user = await User.findByIdAndUpdate(
//             userId,          // ✅ pass id directly
//             data,
//             { new: true, runValidators: true }  // ✅ correct options
//         );
//         if (!user) {
//             return res.status(404).send("User not found");
//         }
//         console.log(user);
//         res.send("User updated successfully");
//     }
//     catch (err) {
//         res.status(400).send("Update failed: " + err.message);
//     }
// });

// Accept or reject a connection request
userRouter.patch("/user/requests/:requestId/respond", userAuth, async(req, res) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body; // "accept" or "reject"
        const loggedinUser = req.user;

        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({ message: "Action must be 'accept' or 'reject'" });
        }

        const connectionRequestDoc = await ConnectionRequest.findById(requestId);
        
        if (!connectionRequestDoc) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        // Check if the logged-in user is the recipient of this request
        if (connectionRequestDoc.toUserId.toString() !== loggedinUser._id.toString()) {
            return res.status(403).json({ message: "You can only respond to requests sent to you" });
        }

        if (action === "accept") {
            connectionRequestDoc.status = "accepted";
            await connectionRequestDoc.save();
            
            res.json({
                message: "Connection request accepted successfully",
                data: connectionRequestDoc
            });
        } else {
            connectionRequestDoc.status = "rejected";
            await connectionRequestDoc.save();
            
            res.json({
                message: "Connection request rejected successfully",
                data: connectionRequestDoc
            });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = userRouter;