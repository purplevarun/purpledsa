export const config = {
	runtime: "edge",
};

export default async function handler(request: Request) {
	if (request.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	const requestBody =
		typeof body === "object" && body !== null
			? (body as {
					query?: unknown;
					variables?: unknown;
				})
			: {};

	const payload = {
		query: requestBody.query,
		variables: requestBody.variables,
	};

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Referer: "https://leetcode.com",
	};

	const response = await fetch("https://leetcode.com/graphql", {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
	});

	const text = await response.text();
	return new Response(text, {
		status: response.status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
