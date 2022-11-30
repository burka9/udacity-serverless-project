"use strict";

module.exports.hello = async (event) => {
	return {
		statusCode: 200,
		body: JSON.stringify(
			{
				message: "You know how to deploy serverless now!",
				input: event,
			},
			null,
			2
		),
	};
};