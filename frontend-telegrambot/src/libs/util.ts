import { SessionData } from '../types';

const fetchJSON = async (requestInfo: RequestInfo): Promise<Record<string, unknown>> =>
	fetch(requestInfo).then((value) =>
		value
			.clone()
			.text()
			.then((value) => JSON.parse(value))
			.catch(() => console.log({ error: 'failed to parse JSON of response.' })),
	);

const initial = (): SessionData => ({
	decor: {
		Q1: '',
		Q2: '',
		Q3: '',
		Q4: '',
		Q5: '',
	},
	route: '',
});

const sha256 = async (text: string): Promise<string> =>
	crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then((array_buffer) =>
		Array.from(new Uint8Array(array_buffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join(''),
	);

export { fetchJSON, initial, sha256 };
