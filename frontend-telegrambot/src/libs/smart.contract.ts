import { getHttpV4Endpoint } from '@orbs-network/ton-access';
import { Address, Sender, TonClient4, toNano } from '@ton/ton';
import { NFTCollection } from './NFTCollection';
import { setItemContentCell } from './onChain';

const randomSeed = Math.floor(Math.random() * 10000);

const mintNFT = async (sender: Sender, testnet: boolean = true) => {
	console.log('mintNFT');
	const endpoint = await getHttpV4Endpoint({ network: testnet ? 'testnet' : 'mainnet' });
	const client = new TonClient4({ endpoint });
	const address = Address.parse('EQB-q8y3FuPw_njECZLEqJZPqDAhdi_yC9c8c7xyEOVxod1t');
	const nftCollection = NFTCollection.createFromAddress(address);
	let contract = client.open(nftCollection);
	await contract.sendMintNFT(sender, {
		value: toNano(0.02),
		queryId: randomSeed,
		amount: toNano(0.02),
		itemIndex: 0,
		itemOwnerAddress: sender.address!,
		itemContent: setItemContentCell({
			name: 'اتاق نشیمن',
			description: 'اتاق نشیمن در سایت دکورستان https://decorestan.com/',
			image: 'https://decorestan.com/wp-content/uploads/2023/12/%D8%A7%D8%AA%D8%A7%D9%82-%D9%86%D8%B4%DB%8C%D9%85%D9%86.webp',
		}),
	});
	console.log('mintNFT finished.');
};

export { mintNFT };
