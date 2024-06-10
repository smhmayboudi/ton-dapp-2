import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { NFT } from '../wrappers/NFT';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('NFT', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NFT');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let nFT: SandboxContract<NFT>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        nFT = blockchain.openContract(NFT.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await nFT.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nFT.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nFT are ready to use
    });
});
