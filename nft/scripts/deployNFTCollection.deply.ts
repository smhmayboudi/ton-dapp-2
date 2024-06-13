import { Address, toNano } from '@ton/ton';
import { NFTCollection } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { contentConfigToCell } from './nftContent/onChain';

const randomSeed = Math.floor(Math.random() * 10000);

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const nftCollection = provider.open(
        NFTCollection.createFromConfig(
            {
                ownerAddress: provider.sender().address!,
                nextItemIndex: 0,
                content: contentConfigToCell({
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
    await nftCollection.sendDeploy(provider.sender(), toNano(0.05));
    await provider.waitForDeploy(nftCollection.address);
}
