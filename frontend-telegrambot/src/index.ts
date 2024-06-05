import { Bot, Composer, GrammyError, HttpError, lazySession, webhookCallback } from 'grammy';
import { Env, CustomApi, CustomContext, SessionData } from './types';
import routers from './routers';
import composers from './composers';
import { autoChatAction } from '@grammyjs/auto-chat-action';
import { D1Adapter } from '@grammyjs/storage-cloudflare';
import { hydrateApi, hydrateContext } from '@grammyjs/hydrate';
import { Hono } from 'hono';
import { initial, sha256 } from './libs';
import { HTTPException } from 'hono/http-exception';

const app = new Hono<Env>();

app.get('/:sha256_bot_token/webhook/:webhook_command', async (ctx) => {
	const { sha256_bot_token, webhook_command } = ctx.req.param();
	const sha256BotToken = await sha256(ctx.env.BOT_TOKEN);
	if (sha256_bot_token !== sha256BotToken) {
		return new Response();
	}
	const bot = new Bot<CustomContext, CustomApi>(ctx.env.BOT_TOKEN);
	if (webhook_command === 'del') {
		await bot.api.deleteWebhook();
		return ctx.json(null);
	} else if (webhook_command === 'getInfo') {
		const response = await bot.api.getWebhookInfo();
		return ctx.json(response);
	} else if (webhook_command === 'set') {
		const workerURL = ctx.req.url.replace(ctx.req.path, '/bot');
		await bot.api.setWebhook(workerURL);
		return ctx.json(null);
	}
	return ctx.json(null, 404);
});

app.use('/bot', async (ctx) => {
	const bot = new Bot<CustomContext, CustomApi>(ctx.env.BOT_TOKEN);
	const getSessionKey = (ctx: Omit<CustomContext, 'session'>) =>
		ctx.from === undefined || ctx.chat === undefined ? undefined : `${ctx.chat.id}:${ctx.from.id}`;
	const storage = await D1Adapter.create<SessionData>(ctx.env.D1, 'SessionData');
	const composer = new Composer<CustomContext>();

	bot.use(async (ctxBot, next) => {
		ctxBot.env = ctx.env;
		await next();
	});

	bot.api.config.use(hydrateApi());

	bot
		.use(lazySession({ initial, getSessionKey, storage }))
		.use(hydrateContext<CustomContext>())
		.use(autoChatAction<CustomContext>(bot.api))
		.use(...routers)
		.use(composer.use(...composers));

	bot.catch((err) => {
		const ctx = err.ctx;
		console.error(`Error while handling update ${ctx.update.update_id}:`);
		const e = err.error;
		if (e instanceof GrammyError) {
			console.error('Error in request:', e.description);
		} else if (e instanceof HttpError) {
			console.error('Could not contact Telegram:', e);
		} else {
			console.error('Unknown error:', e);
		}
	});

	return webhookCallback(bot, 'hono')(ctx);
});

app.get('/decor/:prompt', async (ctx) => {
	const { prompt } = ctx.req.param();
	const guidance = 7.5;
	const num_steps = 8;
	const strength = 1;
	const inputs: AiTextToImageInput = { guidance, num_steps, prompt, strength };
	const response = await ctx.env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', inputs);
	return ctx.body(response);
});

app.onError((err, _ctx) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	const errorResponse = new Response('Unknown', { status: 401 });
	return errorResponse;
});

export default app;
