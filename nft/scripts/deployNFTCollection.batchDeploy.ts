import { Address, toNano } from '@ton/ton';
import { NFTCollection } from '../wrappers/NFTCollection';
import { NetworkProvider } from '@ton/blueprint';
import { contentConfigToCell } from './nftContent/onChain';

const randomSeed = Math.floor(Math.random() * 10000);

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));
    const itemIndex = Number.parseInt(args.length > 0 ? args[1] : await ui.input('Item index'));
    const nftCollection = provider.open(NFTCollection.createFromAddress(address));
    await nftCollection.sendBatchDeploy(provider.sender(), {
        queryId: randomSeed,
        itemIndex,
        value: toNano(0.5),
        batch: [
            {
                amount: toNano(0.5),
                item: {
                    ownerAddress: provider.sender().address!,
                    content: contentConfigToCell({
                        name: 'دکوراسیون منزل با مبلمان کرم و قهوه ای ۱',
                        description: 'دکوراسیون منزل در سایت دکورستان https://decorestan.com/ برو ببین',
                        image: 'https://decorestan.com/wp-content/uploads/2024/06/%D8%AF%DA%A9%D9%88%D8%B1%D8%A7%D8%B3%DB%8C%D9%88%D9%86-%D9%85%D9%86%D8%B2%D9%84-%D8%A8%D8%A7-%D9%85%D8%A8%D9%84%D9%85%D8%A7%D9%86-%D9%82%D9%87%D9%88%D9%87-%D8%A7%DB%8C.webp',
                    }),
                },
            },
            {
                amount: toNano(0.5),
                item: {
                    ownerAddress: provider.sender().address!,
                    content: contentConfigToCell({
                        name: 'دکوراسیون منزل با مبلمان کرم و قهوه ای ۲',
                        description: 'دکوراسیون منزل در سایت دکورستان https://decorestan.com/ برو ببین',
                        image: 'https://decorestan.com/wp-content/uploads/2024/06/%D8%AF%DA%A9%D9%88%D8%B1%D8%A7%D8%B3%DB%8C%D9%88%D9%86-%D9%85%D9%86%D8%B2%D9%84-%D8%A8%D8%A7-%D9%85%D8%A8%D9%84%D9%85%D8%A7%D9%86-%D9%85%D8%AF%D8%B1%D9%86.webp',
                    }),
                },
            },
        ],
    });
    await provider.waitForDeploy(nftCollection.address);
}
