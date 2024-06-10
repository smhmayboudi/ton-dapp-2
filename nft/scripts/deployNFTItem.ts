import { Address, toNano } from '@ton/core';
import { NFTItem } from '../wrappers/NFTItem';
import { compile, NetworkProvider } from '@ton/blueprint';
import { setItemContentCell } from './nftContent/onChain';
import { NFTCollection } from '../wrappers/NFTCollection';

const randomSeed= Math.floor(Math.random() * 10000);

export async function run(provider: NetworkProvider, args: string[]) {
    // const nft = provider.open(NFTItem.createFromConfig({}, await compile('NFTItem')));

    // await nft.sendDeploy(provider.sender(), toNano('0.05'));

    // await provider.waitForDeploy(nft.address);

    // // run methods on `nft-item`
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));

    const nftCollection = provider.open(NFTCollection.createFromAddress(address));

    const mint = await nftCollection.sendMintNFT(provider.sender(), {
        value: toNano('0.02'),
        queryId: randomSeed,
        amount: toNano('0.014'),
        itemIndex: 0,
        itemOwnerAddress: provider.sender().address!!,
        itemContent: setItemContentCell({
            name: 'اتاق نشیمن',
            description: 'اتاق نشیمن در سایت دکورستان https://decorestan.com/',
            image: 'https://decorestan.com/wp-content/uploads/2023/12/%D8%A7%D8%AA%D8%A7%D9%82-%D9%86%D8%B4%DB%8C%D9%85%D9%86.webp',
        }),
    });

    ui.write(`NFT Item deployed at https://testnet.tonscan.org/address/${nftCollection.address}`);
}
