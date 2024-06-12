import fs from "fs";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { ICloudinaryResponse, IUploadFile } from "../app/interfaces/file";

cloudinary.config({
	cloud_name: "dmr810p4l",
	api_key: "847319449751949",
	api_secret: "8XGZjxc8BtcWI8XZ1wwCVvg-x_0",
});

// Multer storage configuration
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(process.cwd(), "uploads"));
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

const uploadToCloudinary = async (
	file: IUploadFile
): Promise<ICloudinaryResponse | undefined> => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload(
			file.path,
			// { public_id: file.originalname },
			(error: Error, result: ICloudinaryResponse) => {
				fs.unlinkSync(file.path);
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			}
		);
	});
};

export const fileUploader = {
	upload,
	uploadToCloudinary,
};
