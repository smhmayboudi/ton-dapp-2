import { WalletInfoRemote, encodeTelegramUrlParameters, isTelegramUrl } from '@tonconnect/sdk';
import { InlineKeyboardButton } from 'grammy/types';

const AT_WALLET_APP_NAME = 'telegram-wallet';
const pTimeoutException = Symbol();

const TELEGRAM_BOT_LINK = 'https://t.me/front_end_telegram_bot';

const buildUniversalKeyboard = async function (link: string, wallets: WalletInfoRemote[]): Promise<InlineKeyboardButton[]> {
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
};

const addTGReturnStrategy = function (link: string, strategy: string): string {
	console.log('addTGReturnStrategy', link, strategy);
	const parsed = new URL(link);
	parsed.searchParams.append('ret', strategy);
	link = parsed.toString();

	const lastParam = link.slice(link.lastIndexOf('&') + 1);
	return link.slice(0, link.lastIndexOf('&')) + '-' + encodeTelegramUrlParameters(lastParam);
};

const convertDeeplinkToUniversalLink = function (link: string, walletUniversalLink: string): string {
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
};

const pTimeout = function <T>(promise: Promise<T>, time: number, exception: unknown = pTimeoutException): Promise<T> {
	console.log('pTimeout', promise, time, exception);
	let timer: ReturnType<typeof setTimeout>;
	return Promise.race([promise, new Promise((_r, rej) => (timer = setTimeout(rej, time, exception)))]).finally(() =>
		clearTimeout(timer),
	) as Promise<T>;
};

export { buildUniversalKeyboard, addTGReturnStrategy, convertDeeplinkToUniversalLink, pTimeout };
