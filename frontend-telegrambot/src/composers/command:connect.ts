import { Composer, InputFile } from 'grammy';
import { CustomContext } from '../types';
import { CHAIN, toUserFriendlyAddress } from '@tonconnect/sdk';
import { getWallets, getWalletInfo } from '../ton-connect/wallets';
import QRCode from 'qrcode';
import { getConnector } from '../ton-connect/connector';
import { buildUniversalKeyboard } from '../libs';

let newConnectRequestListenersMap = new Map<number, () => void>();

const composer = new Composer<CustomContext>();

composer.command('connect', async (ctx) => {
	console.log('connect');
	const chatId = ctx.chat.id;
	let messageWasDeleted = false;

	newConnectRequestListenersMap.get(chatId)?.();

	const connector = getConnector(ctx.env.KV, chatId, () => {
		console.log('connect getConnector');
		unsubscribe();
		newConnectRequestListenersMap.delete(chatId);
		deleteMessage();
	});

	await connector.restoreConnection();
	if (connector.connected) {
		console.log('connect connector.connected', connector);
		const connectedName = (await getWalletInfo(connector.wallet!.device.appName))?.name || connector.wallet!.device.appName;
		await ctx.reply(
			`You have already connect ${connectedName} wallet\nYour address: ${toUserFriendlyAddress(
				connector.wallet!.account.address,
				connector.wallet!.account.chain === CHAIN.TESTNET,
			)}\n\n Disconnect wallet firstly to connect a new one`,
		);

		return;
	}

	const unsubscribe = connector.onStatusChange(async (wallet) => {
		console.log('connect connector.onStatusChange', wallet);
		if (wallet) {
			await deleteMessage();

			const walletName = (await getWalletInfo(wallet.device.appName))?.name || wallet.device.appName;
			await ctx.reply(`${walletName} wallet connected successfully`);
			unsubscribe();
			newConnectRequestListenersMap.delete(chatId);
		}
	});

	const wallets = await getWallets();

	const link = connector.connect(wallets);
	const image = await QRCode.toBuffer(link);

	const keyboard = await buildUniversalKeyboard(link, wallets);

	const inputFile = new InputFile(image);
	const botMessage = await ctx.replyWithPhoto(inputFile, {
		reply_markup: {
			inline_keyboard: [keyboard],
		},
	});

	const deleteMessage = async (): Promise<void> => {
		console.log('connect deleteMessage');
		if (!messageWasDeleted) {
			messageWasDeleted = true;
			await ctx.api.deleteMessage(chatId, botMessage.message_id);
		}
	};

	newConnectRequestListenersMap.set(chatId, async () => {
		console.log('connect newConnectRequestListenersMap');
		unsubscribe();

		await deleteMessage();

		newConnectRequestListenersMap.delete(chatId);
	});
});

export default composer;
