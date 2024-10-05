/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

const expected_args = ["name", "email", "subject", "body"]

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
		// detect if missing an argument before using arguments
		expected_args.forEach(arg => {
			console.log(arg)
			if (!args.has(arg)) {
				failed.push(arg)
			}
		});
		console.log(failed)
		if (!failed || !failed.length) {
			return Response.json({ "response": `Failed, missing following arguments: ${failed}` })
		}
		console.log("shouldn't be here")
		const msg = createMimeMessage();
		msg.setSender({ name: args.get("name"), addr: args.get("address") });
		msg.setRecipient("vreosd+websiteemails@proton.me");
		msg.setSubject(args.get("subject"));
		msg.addMessage({
			contentType: 'text/plain',
			data: args.get("body")
		});

		var message = new EmailMessage(
			args.get("address"),
			"vresod+websiteemails@proton.me",
			msg.asRaw()
		);
		try {
			await env.SEB.send(message);
		} catch (e) {
			return new Response(e.message);
		}

		return Response.json({ "response": "Success" });
	},
};