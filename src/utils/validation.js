const validator = require("validator")

const validatesignupdata = (req) => {
    const {firstName, lastName, emailId, password} = req.body;

    if(!firstName || !lastName){
        throw new Error("NAME IS NOT VALID");
    }

    else if(!validator.isEmail(emailId)){
        throw new Error("Email is not a valid email")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("password is too weak")
    }
}

const validateEditProfile = (req) => {
    const allowedEditfields = [
        "firstName",
        "lastName",
        "emailId",
        "photoUrl",
        "gender",
        "age",
        "about",
        "skills"
    ] 

    const isEditAllowed = Object.keys(req.body).every(field => allowedEditfields.includes(field))
    return isEditAllowed;
}

module.exports = {
    validatesignupdata,
    validateEditProfile
}