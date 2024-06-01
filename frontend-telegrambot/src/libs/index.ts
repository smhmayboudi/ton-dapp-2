import { InlineKeyboardButton } from 'grammy/types';
import { SessionData } from '../types';
import { encodeTelegramUrlParameters, isTelegramUrl, WalletInfoRemote } from '@tonconnect/sdk';

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

export const AT_WALLET_APP_NAME = 'telegram-wallet';

export const pTimeoutException = Symbol();

const TELEGRAM_BOT_LINK = 'https://t.me/front_end_telegram_bot';

export function pTimeout<T>(promise: Promise<T>, time: number, exception: unknown = pTimeoutException): Promise<T> {
	console.log('pTimeout', promise, time, exception);
	let timer: ReturnType<typeof setTimeout>;
	return Promise.race([promise, new Promise((_r, rej) => (timer = setTimeout(rej, time, exception)))]).finally(() =>
		clearTimeout(timer),
	) as Promise<T>;
}

export function addTGReturnStrategy(link: string, strategy: string): string {
	console.log('addTGReturnStrategy', link, strategy);
	const parsed = new URL(link);
	parsed.searchParams.append('ret', strategy);
	link = parsed.toString();

	const lastParam = link.slice(link.lastIndexOf('&') + 1);
	return link.slice(0, link.lastIndexOf('&')) + '-' + encodeTelegramUrlParameters(lastParam);
}

export function convertDeeplinkToUniversalLink(link: string, walletUniversalLink: string): string {
	console.log('convertDeeplinkToUniversalLink', link, walletUniversalLink);
	const search = new URL(link).search;
	const url = new URL(walletUniversalLink);

	if (isTelegramUrl(walletUniversalLink)) {
		const startattach = 'tonconnect-' + encodeTelegramUrlParameters(search.slice(1));
		url.searchParams.append('startattach', startattach);
	} else {
		url.search = search;
	}

	return url.toString();
}

export async function buildUniversalKeyboard(link: string, wallets: WalletInfoRemote[]): Promise<InlineKeyboardButton[]> {
	console.log('buildUniversalKeyboard', link, wallets);
	const atWallet = wallets.find((wallet) => wallet.appName.toLowerCase() === AT_WALLET_APP_NAME);
	const atWalletLink = atWallet
		? addTGReturnStrategy(convertDeeplinkToUniversalLink(link, atWallet?.universalLink), TELEGRAM_BOT_LINK!)
		: undefined;

	const keyboard = [
		{
			text: 'Choose a Wallet',
			callback_data: JSON.stringify({ method: 'chose_wallet' }),
		},
		{
			text: 'Open Link',
			url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(link)}`,
		},
	];

	if (atWalletLink) {
		keyboard.unshift({
			text: '@wallet',
			url: atWalletLink,
		});
	}

	return keyboard;
}
