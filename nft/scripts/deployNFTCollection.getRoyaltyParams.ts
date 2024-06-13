import { Address, toNano } from '@ton/ton';
import { NFTCollection } from '../wrappers/NFTCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));
    const nftCollection = provider.open(NFTCollection.createFromAddress(address));
    await nftCollection.sendGetRoyaltyParams(provider.sender(), {
        queryId: 0,
    });
    await provider.waitForDeploy(nftCollection.address);
}
