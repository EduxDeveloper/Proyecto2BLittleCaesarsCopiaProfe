import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";

import customerModel from "../models/customers.js";

//Array de funciones
const loginCustomerController = {};

loginCustomerController.login = async (req, res) => {

    try {
        
        //1-Solicitar Datos
        const { email, password } = req.body;

        //2-Verificar si el correo existe en la base de datos
        const customerFound = await customerModel.findOne({email})

        //Si no existe el correo
        if  (!customerFound){
            return res.status(400).json({message: "Customer not found"})
        }

        //Verificar que la cuenta no este bloqueada
        if(customerFound.timeOut && customerFound.timeOut > Date.now()){
            return res.status(403).json({message: "Blocked account"})
        }

        //validar la contraseña
        const isMatch = await bcrypt.compare(password, customerFound.password)
        
        if(!isMatch){
            //sumar 1 a la cantidad de intentos fallidos
            customerFound.loginAttemps = (customerFound.loginAttemps || 0) + 1
            if(customerFound.loginAttemps >= 7){
                customerFound.timeOut = Date.now() + 5 * 60 * 1000
                customerFound.loginAttemps = 0

                await customerFound.save();
                return res.status(403).json({message: "Blocked acount for many attemps"})
            }

            await customerFound.save();
            return res.status(401).json({message: "Wrong password"})
        }

        customerFound.loginAttemps = 0;
        customerFound.timeOut = null;

        //guardar el token
        const token = jsonwebtoken.sign(
            //1-¿Que vamos a guardar?
            {id: customerFound._id, userType: "customer"},
            //2-Secret Key
            config.JWT.secret,
            //3-cuando expira
            {expiresIn: "30d"}
        )
        
        //El token lo guardamos en una cookie
        res.cookie("authCookie", token);

        return res.status(200).json({message: "Login succesfully"})

    } catch (error) {
        console.log("error", error)
        return res.status(500).json({message: "Internal Server Error"})
    }

}

export default loginCustomerController;