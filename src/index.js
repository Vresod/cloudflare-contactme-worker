/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Resend } from "resend";

export const expected_args = ["name", "replyto", "body"]

// almost entirely copied from the docs
export default {
	/**
	 * @param {Request} request
	 * @param {Env} env
	 * @param {ExecutionContext} ctx
	 * @returns {Promise<Response>}
	 */
	async fetch(request, env, ctx) {
		let headers = new Headers({
			// include "backdoor" to allow development to work
			"Access-Control-Allow-Origin": request.url.includes("localhost") ? '*' : "https://vresod.xyz",
			"Content-Type": "application/json"
		})
		let response = new Response({ "response": "Success" }, { "headers": headers, "status": 200 })
		if (request.method != "POST") {
			response.body = { "response": "Failed, request must be POST" };
			response.status = 400;
			return response
		}
		let args = new URLSearchParams(await request.text())
		let failed = [];
		const resend = new Resend(env.RESEND_API_KEY);
		const my_email = env.MY_EMAIL;
		// detect if missing an argument before using arguments
		expected_args.forEach(arg => {
			if (!args.has(arg)) {
				failed.push(arg)
			}
		});
		if (failed.length) {
			response.body = { "response": `Failed, missing following arguments: ${failed}` }
			response.status = 400
			return response
		}
		const { data, error } = await resend.emails.send({
			from: `${args.get("name")} <${my_email}>`,
			replyTo: args.get("replyto"),
			to: `Vresod <${my_email}>`,
			subject: `Contacted by "${args.get("name")}"`,
			text: args.get("body")
		})
		if (error) {
			response.body = { "response": "Failed, resend threw error", "error": error, "data": data };
			response.status = 400;
			return response;
		}
		return response;
	},
};