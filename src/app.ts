import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { Server } from "http";
import router from "./app/routes";
import httpStatus from "http-status";
import globalErrorHnadlers from "./app/middlewares/globalErrorHandlers";
import cookieParser from "cookie-parser";
import { AppointmentService } from "./app/modules/Appointment/appointment.service";
import cron from "node-cron";
const app: Application = express();

app.use(
	cors({
		origin: ['http://localhost:3000', 'http://localhost:3001'],
		credentials: true,
	}),
);
app.use(cookieParser());

// Parser
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);

cron.schedule('* * * * *', () => {
	console.log('running a task every minute');
	try
	{
		AppointmentService.cancelUnpaidAppointments();
	} catch (err)
	{
		console.log(err);
	}
});

app.get("/", function (req: Request, res: Response) {
	res.send({
		msg: "HealthCare Server........... !!!",
	});
});

app.use("/api/v1", router);
app.use(globalErrorHnadlers);

app.use((req: Request, res: Response, next: NextFunction) => {
	res.status(httpStatus.NOT_FOUND).json({
		success: false,
		message: "API Not Found !!!",
		error: {
			path: req.originalUrl,
			message: "Your Requested Path is not Found !!!"
		}
	});
});

export default app;
