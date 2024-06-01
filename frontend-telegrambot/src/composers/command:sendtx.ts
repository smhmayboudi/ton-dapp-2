import { Composer } from 'grammy';
import { CustomContext } from '../types';
import { getConnector } from '../ton-connect/connector';
import { addTGReturnStrategy, pTimeout, pTimeoutException } from '../libs';
import { UserRejectsError, isTelegramUrl } from '@tonconnect/sdk';
import { getWalletInfo } from '../ton-connect/wallets';

const composer = new Composer<CustomContext>();
const DELETE_SEND_TX_MESSAGE_TIMEOUT_MS = 600000;
const TELEGRAM_BOT_LINK = 'https://t.me/front_end_telegram_bot';

composer.command('sendtx', async (ctx) => {
	const chatId = ctx.chat.id;

	const connector = getConnector(ctx.env.KV, chatId);

	await connector.restoreConnection();
	if (!connector.connected) {
		await ctx.reply('Connect wallet to send transaction');
		return;
	}

	pTimeout(
		connector.sendTransaction({
			validUntil: Math.round((Date.now() + Number(DELETE_SEND_TX_MESSAGE_TIMEOUT_MS)) / 1000),
			messages: [
				{
					amount: '1000000',
					address: '0:0000000000000000000000000000000000000000000000000000000000000000',
				},
			],
		}),
		Number(DELETE_SEND_TX_MESSAGE_TIMEOUT_MS),
	)
		.then(() => {
			ctx.reply(`Transaction sent successfully`);
		})
		.catch((e) => {
			if (e === pTimeoutException) {
				ctx.reply(`Transaction was not confirmed`);
				return;
			}

			if (e instanceof UserRejectsError) {
				ctx.reply(`You rejected the transaction`);
				return;
			}

			ctx.reply(`Unknown error happened`);
		})
		.finally(() => connector.pauseConnection());

	let deeplink = '';
	const walletInfo = await getWalletInfo(connector.wallet!.device.appName);
	if (walletInfo) {
		deeplink = walletInfo.universalLink;
	}

	if (isTelegramUrl(deeplink)) {
		const url = new URL(deeplink);
		url.searchParams.append('startattach', 'tonconnect');
		deeplink = addTGReturnStrategy(url.toString(), TELEGRAM_BOT_LINK!);
	}

	await ctx.reply(`Open ${walletInfo?.name || connector.wallet!.device.appName} and confirm transaction`, {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: `Open ${walletInfo?.name || connector.wallet!.device.appName}`,
						url: deeplink,
					},
				],
			],
		},
	});
});

export default composer;
