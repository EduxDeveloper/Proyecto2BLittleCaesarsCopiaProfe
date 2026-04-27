import express from "express";
import pizzaRoutes from "./src/routes/pizza.js";
import branchesRoutes from "./src/routes/branches.js";
import employeesRoutes from "./src/routes/employees.js";
import customerRoutes from "./src/routes/customer.js";
import registerCustomerRoutes from "./src/routes/registerCustomer.js" 
import cookieParser from "cookie-parser";
<<<<<<< HEAD
import recoveryPassword from "./src/routes/recoveryPassword.js"
=======
import loginCustomers from "./src/routes/loginCustomer.js";
import logoutroute from "./src/routes/logout.js"
import cors from "cors";
>>>>>>> 1dbcb973bf6208c2580f86c36f34ce93a61ec66a

//Creo una constante que es igual a
//la libreria Express
const app = express();

app.use(cors({
    origin: ["http://localhost:5173" , "http://localhost:5174"],
    credentials: true
}))

app.use(cookieParser())

//Para que la API acepte json
app.use(express.json());

app.use("/api/pizzas", pizzaRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/employee", employeesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/registerCustomer", registerCustomerRoutes)
<<<<<<< HEAD
app.use("/api/recoverypassword", recoveryPassword)
=======
app.use("/api/loginCustomers", loginCustomers);
app.use("/api/logOut", logoutroute);
>>>>>>> 1dbcb973bf6208c2580f86c36f34ce93a61ec66a

export default app;
