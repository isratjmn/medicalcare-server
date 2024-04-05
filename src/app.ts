import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { Server } from "http";
import router from "./app/routes";
import httpStatus from "http-status";
import globalErrorHnadlers from "./app/middlewares/globalErrorHandlers";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(cors());
app.use(cookieParser());

// Parser
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);

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
