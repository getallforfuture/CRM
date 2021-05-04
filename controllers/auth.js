const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')
const keys = require('../config/keys')
const User = require('../models/User')

module.exports.login = async (req,res) => {
    const candidate = await User.findOne({ email: req.body.email})
    if(candidate){
        const passwordResult = bcrypt.compareSync(req.body.password,candidate.password)
        if (passwordResult){
            //gen token
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, { expiresIn: 60*60})

            res.status(200).json({
                token: `Bearer ${token}`
            })
        }else {
            //Incorrect password
            res.status(401).json({
                message: 'Incorrect password. Try again.'
            })
        }
    }else {
        res.status(404).json({
            message: 'User not found.'
        })
    }
}

module.exports.register = async (req,res) => {
    //email password
   const candidate = await User.findOne({ email: req.body.email })
    if(candidate){
        res.status(409).json({
            message: 'Email already exists. Try another.'
        })
    }else{
        const salt = bcrypt.genSaltSync(10)
        const password =req.body.password
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password,salt)
        })
        try{
            await user.save()
            res.status(201).json(user)
        }catch (e) {
            errorHandler(res, e)
        }
    }
}