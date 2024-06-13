import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/ton';

type GetStaticDataConfig = {
    value: bigint;
    queryId: number;
};

type NFTItemConfig = {
    index: number;
    collectionAddress: Address;
    ownerAddress: Address;
    content: Cell;
};

type TransferConfig = {
    value: bigint;
    queryId: number;
};

export function nftItemConfigToCell(config: NFTItemConfig): Cell {
    return beginCell()
        .storeUint(config.index, 64)
        .storeAddress(config.collectionAddress)
        .storeAddress(config.ownerAddress)
        .storeRef(config.content) // content
        .endCell();
}

export class NFTItem implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new NFTItem(address);
    }

    static createFromConfig(config: NFTItemConfig, code: Cell, workchain = 0): NFTItem {
        const data = nftItemConfigToCell(config);
        const init = { code, data };
        return new NFTItem(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint): Promise<void> {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTransfer(provider: ContractProvider, via: Sender, config: TransferConfig): Promise<void> {
        await provider.internal(via, {
            value: config.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x5fcc3d14, 32) //operation
                .storeUint(config.queryId, 64)
                .endCell(),
        });
    }

    async sendGetStaticData(provider: ContractProvider, via: Sender, config: GetStaticDataConfig): Promise<void> {
        await provider.internal(via, {
            value: config.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x2fcb26a2, 32) //operation
                .storeUint(config.queryId, 64)
                .endCell(),
        });
    }

    async getNFTData(provider: ContractProvider): Promise<{
        init: bigint | null;
        index: bigint;
        collectionAddress: Address;
        ownerAddress: Address;
        content: Cell;
    }> {
        const nftData = await provider.get('get_nft_data', []);
        const stack = await nftData.stack;
        let init = stack.readBigNumberOpt();
        let index = stack.readBigNumber();
        let collectionAddress = stack.readAddress();
        let ownerAddress = stack.readAddress();
        let content = await stack.readCell();
        return {
            init,
            index,
            collectionAddress,
            ownerAddress,
            content,
        };
    }
}
