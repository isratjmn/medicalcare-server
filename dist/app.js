"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandlers_1 = __importDefault(require("./app/middlewares/globalErrorHandlers"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const appointment_service_1 = require("./app/modules/Appointment/appointment.service");
const node_cron_1 = __importDefault(require("node-cron"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// Parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
node_cron_1.default.schedule('* * * * *', () => {
    console.log('running a task every minute');
    try {
        appointment_service_1.AppointmentService.cancelUnpaidAppointments();
    }
    catch (err) {
        console.log(err);
    }
});
app.get("/", function (req, res) {
    res.send({
        msg: "HealthCare Server........... !!!",
    });
});
app.use("/api/v1", routes_1.default);
app.use(globalErrorHandlers_1.default);
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: "API Not Found !!!",
        error: {
            path: req.originalUrl,
            message: "Your Requested Path is not Found !!!"
        }
    });
});
exports.default = app;
