import { Server } from "http";
import app from "./app";
import config from "./config";

const port = 5000;

async function main() {
	const server: Server = app.listen(config.port, () => {
		console.log("HealthCare Server is Running on PORT.....", port);
	});
}
main();
