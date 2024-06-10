import { Router } from '@grammyjs/router';
import { CustomContext } from '../types';
import consts from '../consts';
import { InputFile, Keyboard } from 'grammy';
import { type PinataPinResponse } from '@pinata/sdk';
import { GetGemsSaleData, NftSale } from '../contracts/NftSale';
import { NftItem } from '../contracts/NftItem';
import { toNano } from '@ton/ton';
import { openWallet, waitSeqno } from '../libs';
import { NftCollection } from '../contracts/NftCollection';

const router = new Router<CustomContext>(async (ctx) => (await ctx.session).route);

router.route('decor-q1', async (ctx) => {
	const metadata = consts.styles.filter((a) => a.text === ctx.msg?.text);
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

router.route('decor-q2', async (ctx) => {
	const metadata = consts.rooms.filter((a) => a.text === ctx.msg?.text);
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
				keyboard: new Keyboard()
					.text(consts.bedrooms[0].text)
					.row()
					.text(consts.bedrooms[1].text)
					.row()
					.text(consts.bedrooms[2].text)
					.row()
					.build(),
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

router.route('decor-q3', async (ctx) => {
	const metadata = consts.bedrooms.filter((a) => a.text === ctx.msg?.text);
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

router.route('decor-q4', async (ctx) => {
	const metadata = consts.meterage.filter((a) => a.text === ctx.msg?.text);
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

router.route('decor-q5', async (ctx) => {
	const metadata = consts.colour.filter((a) => a.text === ctx.msg?.text);
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
	const guidance = 7.5;
	const num_steps = 8;
	const prompt = Object.entries(session.decor)
		.map((a) => a[1])
		.join(' ');
	const strength = 1;
	// Generate Image
	// const inputs: AiTextToImageInput = { guidance, num_steps, prompt, strength };
	// const response = await ctx.env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', inputs);
	// const arrayBuffer = response.buffer;

	// Get Image File
	const url = 'https://decorestan.com/wp-content/uploads/2023/12/%D8%A7%D8%AA%D8%A7%D9%82-%D9%86%D8%B4%DB%8C%D9%85%D9%86.webp';
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();

	// Upload Image
	const datetime = new Date().getTime();
	const fileImage = new File([arrayBuffer], `${datetime}.webp`, { type: 'image/webp' });
	const { IpfsHash: IpfsHashImage } = await uploadFile(ctx.env.PINATA_JWT, fileImage, fileImage.name);

	// Generate Meta
	const meta = {
		name: `Decorestan ${fileImage.name}`,
		description: 'An AI generated by https://decorestan.com/',
		image: `ipfs://${IpfsHashImage}.${fileImage.type}`,
		attributes: [
			{ trait_type: 'Style', value: session.decor.Q1 },
			{ trait_type: 'Room', value: session.decor.Q2 },
			{ trait_type: 'Bedroom', value: session.decor.Q3 },
			{ trait_type: 'Meterage', value: session.decor.Q4 },
			{ trait_type: 'Colour', value: session.decor.Q5 },
		],
	};

	// Upload Meta
	const fileMeta = new File([JSON.stringify(meta)], `${datetime}.json`, { type: 'application/json' });
	const { IpfsHash: IpfsHashMeta } = await uploadFile(ctx.env.PINATA_JWT, fileMeta, fileMeta.name);

	const wallet = await openWallet(ctx.env.MNEMONIC.split(' '));
	let seqno = await wallet.contract.getSeqno();

	// Mint
	const mintParams = {
		queryId: 0,
		itemOwnerAddress: wallet.contract.address,
		itemIndex: 0,
		amount: toNano('0.05'),
		commonContentUrl: `ipfs://${IpfsHashMeta}/${fileMeta.name}`,
	};

	NftCollection.
	const collection = new NftCollection({});
	const nftItem = new NftItem(collection);
	seqno = await nftItem.deploy(wallet, mintParams);
	await waitSeqno(seqno, wallet);

	const saleData: GetGemsSaleData = {
		isComplete: false,
		createdAt: Math.ceil(Date.now() / 1000),
		marketplaceAddress: marketplace.address,
		nftAddress: nftToSaleAddress,
		nftOwnerAddress: null,
		fullPrice: toNano('10'),
		marketplaceFeeAddress: wallet.contract.address,
		marketplaceFee: toNano('1'),
		royaltyAddress: wallet.contract.address,
		royaltyAmount: toNano('0.5'),
	};

	const nftSaleContract = new NftSale(saleData);
	seqno = await nftSaleContract.deploy(wallet);
	await waitSeqno(seqno, wallet);

	await NftItem.transfer(wallet, nftToSaleAddress, nftSaleContract.address);

	const inputFile = new InputFile(response, fileImage.name);
	await ctx.replyWithPhoto(inputFile, {
		caption: `https://ipfs.io/ipfs/${IpfsHashImage} OR curl ipfs://${IpfsHashImage} --ipfs-gateway ipfs.io
        \nhttps://gateway.pinata.cloud/ipfs/${IpfsHashImage} OR curl ipfs://${IpfsHashImage} --ipfs-gateway gateway.pinata.cloud
		\nhttps://ipfs.io/ipfs/${IpfsHashMeta} OR curl ipfs://${IpfsHashMeta} --ipfs-gateway ipfs.io
        \nhttps://gateway.pinata.cloud/ipfs/${IpfsHashMeta} OR curl ipfs://${IpfsHashMeta} --ipfs-gateway gateway.pinata.cloud`,
		reply_markup: { remove_keyboard: true },
	});
});

export default router;

const ai = async (cloudflareAccountID: string, cloudflareAPIToken: string, input: AiTextToImageInput): Promise<ArrayBuffer> => {
	const request = new Request(
		`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountID}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
		{
			body: JSON.stringify(input),
			headers: { Authorization: `Bearer ${cloudflareAPIToken}` },
			method: 'POST',
		},
	);
	const response = await fetch(request);
	return response.arrayBuffer();
};

const uploadFile = async (pinataJWT: string, file: Blob, filename: string): Promise<PinataPinResponse> => {
	const form = new FormData();
	form.append('file', file, filename);
	// form.append('pinataMetadata', JSON.stringify({ name: `${filename}` }));
	// form.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));
	const request = new Request('https://api.pinata.cloud/pinning/pinFileToIPFS', {
		body: form,
		headers: { Authorization: `Bearer ${pinataJWT}` },
		method: 'POST',
	});
	const response = await fetch(request);
	return response.json() as Promise<PinataPinResponse>;
};
