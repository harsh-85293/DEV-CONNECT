const express = require("express");

const app = express();

app.get("/admin/getallData", () => {
    //Logic of fetching all data
    const token = "xyz";
    const isAdminAuthorized = token === "xyz";
    if(isAdminAuthorized){
        res.send("All Data sent");
    }
    else{
        res.status(401).send("Unauthorized request");
    }
});

app.get("/admin/deleteallData", () => {
    //Delete a user
    //Logic of fetching all data
    const token = "xyz";
    const isAdminAuthorized = token === "xyz";
    if(isAdminAuthorized){
        res.send("All Data sent");
    }
    else{
        res.status(401).send("Unauthorized request");
    }
    res.send("Deleted a user");
});

app.listen(3000, () => {
    console.log("Server is successfully running on port 3000");
});