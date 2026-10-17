import express from "express";
import EmployeeController from "../controllers/EmployeeController.js";

const employeeRouter = express.Router();

employeeRouter.get("/", EmployeeController.getAllEmployees);
employeeRouter.get("/:id", EmployeeController.getEmployeeById);
employeeRouter.post("/", EmployeeController.createEmployee);
employeeRouter.put("/:id", EmployeeController.updateEmployee);
employeeRouter.delete("/:id", EmployeeController.deleteEmployee);

export default employeeRouter;
