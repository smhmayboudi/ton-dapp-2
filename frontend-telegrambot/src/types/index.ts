import { Api, Context, LazySessionFlavor } from 'grammy';
import { AutoChatActionFlavor } from '@grammyjs/auto-chat-action';
import { HydrateApiFlavor, HydrateFlavor } from '@grammyjs/hydrate';

interface Decor {
	Q1: string; // سبک
	Q2: string; // نوع اتاق
	Q3: string; // نوع اتاق خواب
	Q4: string; // متراژ
	Q5: string; // رنگ
}

type Env = {
	Bindings: {
		AI: unknown;
		BOT_TOKEN: string;
		D1: D1Database;
		KV: KVNamespace;
	};
	Variables: {};
};

type CustomApi = HydrateApiFlavor<Api>;

type CustomContext = HydrateFlavor<
	{
		env: Env['Bindings'];
	} & Context &
		AutoChatActionFlavor &
		LazySessionFlavor<SessionData>
>;

type Metadata = {
	data: string;
	text: string;
};

type SessionData = {
	decor: Decor;
	route: string;
};

export type { Env, CustomApi, CustomContext, Metadata, SessionData };
