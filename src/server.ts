import app from "./app";
import { Server } from "http";
import config from "./config";

async function bootstrap() {
	const server: Server = app.listen(config.port, () => {
		console.log("HealthCare Server is Running on PORT.....", config.port);
	});
	const existHandler = () => {
		if (server)
		{
			server.close(() => {
				console.info("Server Closed....");
			});
		}
		process.exit(1);
	};
	process.on("uncaughtException", (error) => {
		console.log(error);
		existHandler();
	});
	process.on("unhandledRejection", (error) => {
		console.log(error);
		existHandler();
	});

}
bootstrap();
