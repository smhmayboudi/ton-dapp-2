import { Composer } from 'grammy';
import { CustomContext } from '../types';
import { initial } from '../libs';

const composer = new Composer<CustomContext>();

composer.command('settings', async (ctx) => {
	const session = await ctx.session;
	session.decor = initial().decor;
	session.route = initial().route;

	await ctx.reply('اکانت شما ریست شد.', {
		reply_markup: { remove_keyboard: true },
	});
});

export default composer;
