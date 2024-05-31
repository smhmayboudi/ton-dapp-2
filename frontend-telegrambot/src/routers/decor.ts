import {Router} from '@grammyjs/router';
import {CustomContext} from '../types';
import consts from '../consts';
import {InputFile, Keyboard} from 'grammy';
import {Ai} from '@cloudflare/ai';
import {AiTextToImageInput} from '@cloudflare/ai/dist/ai/tasks/text-to-image';

const router = new Router<CustomContext>(async ctx => (await ctx.session).route);

router.route('decor-q1', async ctx => {
  const metadata = consts.styles.filter(a => a.text === ctx.msg?.text);
  if (metadata.length === 0) {
    await ctx.reply('یکی از سبک های پیشنهادی رو انتخاب کن.', {
      // reply_markup: {remove_keyboard: true},
    });
    return;
  }

  const session = await ctx.session;
  session.decor.Q1 = metadata[0].data;

  session.route = 'decor-q2';
  await ctx.reply('اتاق مورد علاقه‌ات رو انتخاب کن.', {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text(consts.rooms[0].text)
        .text(consts.rooms[1].text)
        .row()
        .text(consts.rooms[2].text)
        .text(consts.rooms[3].text)
        .row()
        .build(),
    },
  });
});

router.route('decor-q2', async ctx => {
  const metadata = consts.rooms.filter(a => a.text === ctx.msg?.text);
  if (metadata.length === 0) {
    await ctx.reply('یکی از اتاق‌های پیشنهادی رو انتخاب کن.', {
      // reply_markup: {remove_keyboard: true},
    });
    return;
  }

  const session = await ctx.session;
  session.decor.Q2 = metadata[0].data;

  if (metadata[0].text === 'اتاق‌خواب') {
    session.route = 'decor-q3';
    await ctx.reply('اتاق‌خواب مورد نظرت رو انتخاب کن.', {
      reply_markup: {
        one_time_keyboard: true,
        keyboard: new Keyboard().text(consts.beds[0].text).row().text(consts.beds[1].text).row().text(consts.beds[2].text).row().build(),
      },
    });
  }

  if (metadata[0].text === 'کلوزت') {
    session.route = 'decor-q4';
    await ctx.reply('متراژ مورد نظرت رو انتخاب کن.', {
      reply_markup: {
        one_time_keyboard: true,
        keyboard: new Keyboard()
          .text(consts.meterage[0].text)
          .row()
          .text(consts.meterage[1].text)
          .row()
          .text(consts.meterage[2].text)
          .row()
          .build(),
      },
    });
  }

  if (metadata[0].text === 'آشپزخانه') {
    session.route = 'decor-q4';
    await ctx.reply('متراژ مورد نظرت رو انتخاب کن.', {
      reply_markup: {
        one_time_keyboard: true,
        keyboard: new Keyboard()
          .text(consts.meterage[0].text)
          .row()
          .text(consts.meterage[1].text)
          .row()
          .text(consts.meterage[2].text)
          .row()
          .build(),
      },
    });
  }

  if (metadata[0].text === 'اتاق نشیمن') {
    session.route = 'decor-q4';
    await ctx.reply('متراژ مورد نظرت رو انتخاب کن.', {
      reply_markup: {
        one_time_keyboard: true,
        keyboard: new Keyboard()
          .text(consts.meterage[0].text)
          .row()
          .text(consts.meterage[1].text)
          .row()
          .text(consts.meterage[2].text)
          .row()
          .build(),
      },
    });
  }
});

router.route('decor-q3', async ctx => {
  const metadata = consts.beds.filter(a => a.text === ctx.msg?.text);
  if (metadata.length === 0) {
    await ctx.reply('یکی از اتاق‌خواب‌های پیشنهادی رو انتخاب کن.', {
      // reply_markup: {remove_keyboard: true},
    });
    return;
  }

  const session = await ctx.session;
  session.decor.Q3 = metadata[0].data;

  session.route = 'decor-q4';
  await ctx.reply('متراژ مورد نظرت رو انتخاب کن.', {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text(consts.meterage[0].text)
        .row()
        .text(consts.meterage[1].text)
        .row()
        .text(consts.meterage[2].text)
        .row()
        .build(),
    },
  });
});

router.route('decor-q4', async ctx => {
  const metadata = consts.meterage.filter(a => a.text === ctx.msg?.text);
  if (metadata.length === 0) {
    await ctx.reply('یک متراژ درست انتخاب کن.', {
      // reply_markup: {remove_keyboard: true},
    });
    return;
  }

  const session = await ctx.session;
  session.decor.Q4 = metadata[0].data;

  session.route = 'decor-q5';
  await ctx.reply('رنگ مورد علاقه‌‌ات رو انتخاب کن.', {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text(consts.colour[0].text)
        .text(consts.colour[1].text)
        .text(consts.colour[2].text)
        .row()
        .text(consts.colour[3].text)
        .text(consts.colour[4].text)
        .text(consts.colour[5].text)
        .row()
        .text(consts.colour[6].text)
        .text(consts.colour[7].text)
        .text(consts.colour[8].text)
        .row()
        .text(consts.colour[9].text)
        .text(consts.colour[10].text)
        .text(consts.colour[11].text)
        .row()
        .build(),
    },
  });
});

router.route('decor-q5', async ctx => {
  const metadata = consts.colour.filter(a => a.text === ctx.msg?.text);
  if (metadata.length === 0) {
    await ctx.reply('رنگ مورد علاقه‌ات رو انتخاب کن.', {
      // reply_markup: {remove_keyboard: true},
    });
    return;
  }

  const session = await ctx.session;
  session.decor.Q5 = metadata[0].data;

  session.route = '';
  ctx.chatAction = 'upload_photo';
  const ai = new Ai(ctx.env?.AI);
  const guidance = 7.5;
  const num_steps = 8;
  const prompt = Object.entries(session.decor)
    .map(a => a[1])
    .join(' ');
  const strength = 1;
  const inputs: AiTextToImageInput = {guidance, num_steps, prompt, strength};
  const response = await ai.run('@cf/bytedance/stable-diffusion-xl-lightning', inputs);
  const inputFile = new InputFile(response);
  await ctx.replyWithPhoto(inputFile, {
    reply_markup: {remove_keyboard: true},
  });
});

export default router;
