//This will define the connection between any two users

const mongoose = require("mongoose")

const connectionRequestSchema = new mongoose.Schema({
    fromUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,//making this a mandatory field
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
    },
    status : {
        type : String,
        required : true,
        enum : {
            values : ["ignore", "interested", "rejected", "accepted"],
            message : `{VALUE} is incorrect status type`
        }
    }
},
{
    timestamps : true,
}
)

//Compound index
//Now this query will become very fast
//1 -> ascending order
connectionRequestSchema.index({
    fromUserId : 1, //1 means ascending order
    toUserId : 1
})

//pre('save', …) is a Mongoose middleware that runs before a document is saved (doc.save() / Model.create() etc.).
// ✅ Minimal fix: add (next) as argument so next() is defined
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    //check if from userid and touser id is same
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        return next(new Error("You cannot send connection request to yourself"))
    }
    next();
})

let connectionRequestModel;
try {
    connectionRequestModel = mongoose.model("connectionRequest");
} catch (error) {
    connectionRequestModel = mongoose.model("connectionRequest", connectionRequestSchema);
}

module.exports = connectionRequestModel;
