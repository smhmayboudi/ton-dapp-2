import { Address, toNano } from '@ton/ton';
import { NFTCollection } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { contentConfigToCell } from './nftContent/onChain';

const randomSeed = Math.floor(Math.random() * 10000);

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));
    const nftCollection = provider.open(NFTCollection.createFromAddress(address));
    await nftCollection.sendMintNFT(provider.sender(), {
        queryId: randomSeed,
        itemIndex: 0,
        value: toNano('0.02'),
        amount: toNano('0.014'),
        item: {
            ownerAddress: provider.sender().address!,
            content: contentConfigToCell({
                name: 'اتاق نشیمن',
                description: 'اتاق نشیمن در سایت دکورستان https://decorestan.com/',
                image: 'https://decorestan.com/wp-content/uploads/2023/12/%D8%A7%D8%AA%D8%A7%D9%82-%D9%86%D8%B4%DB%8C%D9%85%D9%86.webp',
            }),
        },
    });
    await provider.waitForDeploy(nftCollection.address);
}
