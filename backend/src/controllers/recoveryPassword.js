import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { config } from "../../config.js";

import customModel from "../models/customers.js";
import { randomBytes } from "crypto";

import HTMLRecoveryEmail from "../utils/sendMailRecovery.js";

const recoveryPasswordController = {};

recoveryPasswordController.requestCode = async (req,res) =>{
    try {
        //#1- solicitamos los datos
        const { email } = req.body;
        
        //Validar que el correo si exista en la base de datks
        const userFound = await customModel.findOne({ email});

        if(!userFound){
            return res.status(404).json({message: "User not Found"});
        }

        //Generamos un codigo aleatorio
         const randomCode = crypto.randomBytes(3).toString("hex"); 

        const token = jsonwebtoken.sign(
            {email, randomCode, userType: "customer", verfied: false},
    
            config.JWT.secret,
            {expiresIn: "15m"}
        );

        res.cookie("recoveryCookie", token, {maxAge: 15 * 60 * 1000})

        //Enviar el codigo por correo electronico
        //#1-¿quien lo envia?
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                user: config.email.user_email,
                pass: config.email.user_password
            }
        })

        //#2- ¿quien lo recibe y como?
        const mailOptions = {
            from: config.email.user_email,
            to: email,
            subject: "Recuperacion de contraseña",
            body: "El codigo vence en 15 minutos",
            html: HTMLRecoveryEmail(randomCode),
        }

        //#3. eviar correo electronco
        transporter.sendMail(mailOptions, (error, info)=>{
            if (error) {
                return res.status(500).json({message: "Error sending mail"})
            }
            return res.status(200).json({message: "Email sent"})
        })

    } catch (error) {
        console.log("error"+ error)
        return res.status(500).json({message: "internal server error"})
    }
}

recoveryPasswordController.verfyCode = async (req, res) =>{
    try {
        
        const { code } = req.body;

        //Obtenemos la infromacion que esta dentro del token
        //accedemos a la cookie
        const token = req.cookies.recoveryCookie
        const decoded = jsonwebtoken.verify(token, config.JWT.secret)

        //Ahora comparar el codigo que el usuario escribio
        //Con el que esta guardado en el token
        if(code !== decoded.randomCode){
            return res.status(400).json({message: "invalid conde"})
        }
        //En cambio si lo escribe bien
        //vamos a colocar en el token que ya esta verificado
        const newToken = jsonwebtoken.sign(
            {email: decoded.email, userType: "customer", verfied: true},
            //secret key
            config.JWT.secret,
            //cuando expira
            {expiresIn: "15m"}
        )

        res.cookie("recoveryCookie", newToken, {maxAge: 15 * 60 * 1000});

        return res.status(200).json({message: "code verified"});

    } catch (error) {
          console.log("error"+ error)
            return res.status(500).json({message: "internal server error"})      
    }
}

recoveryPasswordController.newPassword = async (req, res) => {
    
    try {
        const {newPassword, confirmNewPassoword} = req.body;

        if(newPassword !== confirmNewPassoword){
            return res.status(400).json({message: "password dosent match"})
        }

        const token = req.cookies.recoveryCookie
        const decoded = jsonwebtoken.verify(token, config.JWT.secret)

        if(!decoded.verfied){
            return res.status(400).json({message: "code not verified"})
        }

        //ENCRIPTAR CONTRASEÑAA
        const passwordHash = await bcrypt.hash(newPassword, 10);

        //Actualizar la contraseña en la base de datos
        await customModel.findOneAndUpdate(
            {email: decoded.email},
            {password: passwordHash},
            {new: true}
        )

        res.clearCookie("recoveryCookie");

        return res.status(200).json({message: "password updated"})

    } catch (error) {
        console.log("error"+ error)
        return res.status(500).json({message: "internal server error"})      
    }
}

export default recoveryPasswordController;