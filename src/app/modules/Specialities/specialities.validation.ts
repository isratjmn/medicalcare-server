import { z } from "zod";

const createSchema = z.object({
	title: z.string({
		required_error: "Title is required",
	}),
});

export const specialitiesvalidation = {
	createSchema,
};
