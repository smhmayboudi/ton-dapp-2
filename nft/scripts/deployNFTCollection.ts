import { toNano } from '@ton/core';
import { NFTCollection } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const nft = provider.open(NFTCollection.createFromConfig({}, await compile('NFTCollection')));

    await nft.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nft.address);

    // run methods on `nft-collection`
}
