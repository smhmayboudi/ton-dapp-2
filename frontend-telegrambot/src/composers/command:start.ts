import {Composer, Keyboard} from 'grammy';
import {CustomContext} from '../types';
import consts from '../consts';

const composer = new Composer<CustomContext>();

composer.command('start', async ctx => {
  await ctx.reply('سلام من دکورستانم\nبا اطلاعاتی که بهم می‌دی می‌تونم خونه‌ات رو چیدمان کنم.', {
    reply_markup: {remove_keyboard: true},
  });

  const session = await ctx.session;
  session.decor.Q1 = '';
  session.decor.Q2 = '';
  session.decor.Q3 = '';
  session.decor.Q4 = '';
  session.decor.Q5 = '';

  session.route = 'decor-q1';
  await ctx.reply('سبک مورد علاقه‌ات رو انتخاب کن.', {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text(consts.styles[0].text)
        .text(consts.styles[1].text)
        .row()
        .text(consts.styles[2].text)
        .text(consts.styles[3].text)
        .row()
        .text(consts.styles[4].text)
        .text(consts.styles[5].text)
        .row()
        .text(consts.styles[6].text)
        .text(consts.styles[7].text)
        .row()
        .build(),
    },
  });
});

const help = 'To decor, do /decor.';

export default composer;
export {help};
