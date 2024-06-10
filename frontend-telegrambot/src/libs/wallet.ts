import { WalletInfoRemote, encodeTelegramUrlParameters, isTelegramUrl } from '@tonconnect/sdk';
import { InlineKeyboardButton } from 'grammy/types';
import { getHttpV4Endpoint } from '@orbs-network/ton-access';
import { KeyPair, mnemonicToWalletKey } from '@ton/crypto';
import { OpenedContract, TonClient4, WalletContractV4 } from '@ton/ton';

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

export async function openWallet(mnemonic: string[], testnet: boolean = true) {
	const keyPair = await mnemonicToWalletKey(mnemonic);
	// const toncenterBaseEndpoint: string = testnet ? 'https://testnet.toncenter.com' : 'https://toncenter.com';
	// const client = new TonClient({
	// 	endpoint: `${toncenterBaseEndpoint}/api/v2/jsonRPC`,
	// 	apiKey: process.env.TONCENTER_API_KEY,
	// });
	const endpoint = await getHttpV4Endpoint({ network: testnet ? 'testnet' : 'mainnet' });
	const client = new TonClient4({ endpoint });
	const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
	let contract = client.open(wallet);
	return { contract, keyPair };
}

export type OpenedWallet = {
	contract: OpenedContract<WalletContractV4>;
	keyPair: KeyPair;
};
