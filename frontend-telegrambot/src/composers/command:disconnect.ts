import { Composer } from 'grammy';
import { CustomContext } from '../types';
import { getConnector } from '../ton-connect/connector';

const composer = new Composer<CustomContext>();

composer.command('disconnect', async (ctx) => {
	const chatId = ctx.chat.id;

	const connector = getConnector(ctx.env.KV, chatId);

	await connector.restoreConnection();
	if (!connector.connected) {
		await ctx.reply("You didn't connect a wallet");
		return;
	}

	await connector.disconnect();

	await ctx.reply('Wallet has been disconnected');
});

export default composer;
