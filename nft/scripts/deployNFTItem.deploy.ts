import { Address, Cell, toNano } from '@ton/ton';
import { NetworkProvider, compile } from '@ton/blueprint';
import { NFTItem } from '../wrappers/NFTItem';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const index = 0;
    const collectionAddress = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));
    const ownerAddress = Address.parse(args.length > 0 ? args[0] : await ui.input('Owner address'));
    const content = new Cell();
    const nft = provider.open(
        NFTItem.createFromConfig({ index, collectionAddress, ownerAddress, content }, await compile('NFTItem')),
    );
    await nft.sendDeploy(provider.sender(), toNano(0.05));
    await provider.waitForDeploy(nft.address);
}
