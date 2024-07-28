const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true,'Enter the name'],
        },
        email: {
            type: String,
            required: [true,'Enter the email'],
            unique: true,
            lowercase:true,
            validate: [validator.isEmail, 'Provide a valid email']
        },
        photo: {
            type: String,
        },
        role:{
            type: String,
            enum: ['user','guide','lead-guide','admin'],
            default: 'user'
        },
        password: {
            type: String,
            required: [true,'Enter the password'],
            minlength: [8, 'Min 8 char'],
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true,'Confirm the password'],
            validate: {
                // This only works on create and save()
                validator:function(el){
                    return el === this.password;
                },
                message: 'Passwords are not same'
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        }
    }
)

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password') || this.isNew) return next();
    
    this.passwordChangedAt = Date.now() - 1000;
    next();
})




// filter every query which start with find
userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();
})


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        return JWTTimestamp<changedTimestamp
    }
    return false;
};

userSchema.methods.crPassReset = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires=Date.now()+10*60*1000;


    console.log(resetToken);

    console.log(this.passwordResetToken);
    
    return resetToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;