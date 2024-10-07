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
		let args = new URL(request.url).searchParams;
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
			return Response.json({ "response": `Failed, missing following arguments: ${failed}` }, { "status": 400 })
		}
		const { data, error } = await resend.emails.send({
			from: my_email,
			replyTo: args.get("replyto"),
			to: my_email,
			subject: `Contacted by "${args.get("name")}"`,
			text: args.get("body")
		})
		if (error) {
			return Response.json({ "response": "Failed, resend threw error", "error": error, "data": data }, { "status": 400 })
		}

		return new Response("Success");
	},
};