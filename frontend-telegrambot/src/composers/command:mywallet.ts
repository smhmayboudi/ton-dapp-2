import { Composer } from 'grammy';
import { CustomContext } from '../types';
import { getConnector } from '../ton-connect/connector';
import { getWalletInfo } from '../ton-connect/wallets';
import { CHAIN, toUserFriendlyAddress } from '@tonconnect/sdk';

const composer = new Composer<CustomContext>();

composer.command('mywallet', async (ctx) => {
	const chatId = ctx.chat.id;

	const connector = getConnector(ctx.env.KV, chatId);

	await connector.restoreConnection();
	if (!connector.connected) {
		await ctx.reply("You didn't connect a wallet");
		return;
	}

	const walletName = (await getWalletInfo(connector.wallet!.device.appName))?.name || connector.wallet!.device.appName;

	await ctx.reply(
		`Connected wallet: ${walletName}\nYour address: ${toUserFriendlyAddress(
			connector.wallet!.account.address,
			connector.wallet!.account.chain === CHAIN.TESTNET,
		)}`,
	);
});

export default composer;
