import { Address, toNano } from '@ton/core';
import { NFTCollection } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { buildCollectionContentCell } from './nftContent/onChain';
import { run as run2 } from './deployNFTItem';

export async function run(provider: NetworkProvider) {
    // const nft = provider.open(NFTCollection.createFromConfig({}, await compile('NFTCollection')));

    // await nft.sendDeploy(provider.sender(), toNano('0.05'));

    // await provider.waitForDeploy(nft.address);

    // // run methods on `nft-collection`
    const nftCollection = provider.open(
        NFTCollection.createFromConfig(
            {
                ownerAddress: provider.sender().address!!,
                nextItemIndex: 0,
                collectionContent: buildCollectionContentCell({
                    name: 'مجموعه دکورستان',
                    description: 'هر یک از عکس ها قصه ای در خود دارد.',
                    image: 'https://decorestan.com/wp-content/uploads/2023/12/%D8%A7%D8%AA%D8%A7%D9%82-%D9%86%D8%B4%DB%8C%D9%85%D9%86.webp',
                }),
                nftItemCode: await compile('NftItem'),
                royaltyParams: {
                    royaltyFactor: Math.floor(Math.random() * 500),
                    royaltyBase: 1000,
                    royaltyAddress: provider.sender().address as Address,
                },
            },
            await compile('NftCollection'),
        ),
    );

    console.log(provider.sender().address as Address);
    await nftCollection.sendDeploy(provider.sender(), toNano('0.05'));
    console.log();
    await provider.waitForDeploy(nftCollection.address);
    await run2(provider, [nftCollection.address.toRawString()]);
}
