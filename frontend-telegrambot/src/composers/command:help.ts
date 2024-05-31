import {Composer} from 'grammy';
import {CustomContext} from '../types';
import {helps} from './';

const composer = new Composer<CustomContext>();

composer.command('help', async ctx => {
  await ctx.reply(helps.join(' '), {
    reply_markup: {remove_keyboard: true},
  });
});

export default composer;
