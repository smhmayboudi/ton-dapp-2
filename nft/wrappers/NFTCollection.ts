import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    DictionaryValue,
    Sender,
    SendMode,
    Slice,
    TupleItemCell,
    TupleItemInt,
} from '@ton/ton';

type BatchConfig = {
    amount: bigint;
    item: ItemConfig;
};

type BatchDeployConfig = {
    queryId: number;
    itemIndex: number;
    value: bigint;
    batch: BatchConfig[];
};

type ChangeOwnerConfig = {
    value: bigint;
    queryId: number;
    newOwnerAddress: Address;
};


type CollectionData = {
    nextItem: bigint;
    ownerAddress: Address;
    content: Cell;
};

type GetRoyaltyParamsConfig = {
    queryId: number;
};

type ItemConfig = {
    ownerAddress: Address;
    content: Cell;
};

type MintNFTConfig = {
    queryId: number;
    itemIndex: number;
    value: bigint;
    amount: bigint; // to send with nft
    item: ItemConfig;
};

type NFTCollectionConfig = {
    ownerAddress: Address;
    nextItemIndex: number;
    content: Cell;
    nftItemCode: Cell;
    royaltyParams: RoyaltyParamsConfig;
};

type RoyaltyParamsConfig = {
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
};

function royaltyParamsConfigToCell(config: RoyaltyParamsConfig): Cell {
    return beginCell()
        .storeUint(config.royaltyFactor, 16)
        .storeUint(config.royaltyBase, 16)
        .storeAddress(config.royaltyAddress)
        .endCell();
}

export function nftCollectionConfigToCell(config: NFTCollectionConfig): Cell {
    return beginCell()
        .storeAddress(config.ownerAddress)
        .storeUint(config.nextItemIndex, 64)
        .storeRef(config.content)
        .storeRef(config.nftItemCode)
        .storeRef(royaltyParamsConfigToCell(config.royaltyParams))
        .endCell();
}

function nftItemConfigToCell(item: ItemConfig): Cell {
    return beginCell().storeAddress(item.ownerAddress).storeRef(item.content).endCell();
}

export class NFTCollection implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new NFTCollection(address);
    }

    static createFromConfig(config: NFTCollectionConfig, code: Cell, workchain = 0): NFTCollection {
        const data = nftCollectionConfigToCell(config);
        const init = { code, data };
        return new NFTCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint): Promise<void> {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendGetRoyaltyParams(provider: ContractProvider, via: Sender, config: GetRoyaltyParamsConfig): Promise<void> {
        await provider.internal(via, {
            value: 0n,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x693d3950, 32) // operation code
                .storeUint(config.queryId, 64)
                .endCell(),
        });
    }

    async sendMintNFT(provider: ContractProvider, via: Sender, config: MintNFTConfig): Promise<void> {
        await provider.internal(via, {
            value: config.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32) // operation code
                .storeUint(config.queryId, 64)
                .storeUint(config.itemIndex, 64)
                .storeCoins(config.amount)
                .storeRef(nftItemConfigToCell(config.item)) // nft_content
                .endCell(),
        });
    }

    async sendBatchDeploy(provider: ContractProvider, via: Sender, config: BatchDeployConfig): Promise<void> {
        if (config.batch.length > 250) {
            throw new Error('Too long list');
        }

        const MintNftDictValue: DictionaryValue<BatchConfig> = {
            serialize(src, builder): void {
                console.log('serialize');
                builder.storeCoins(src.amount);
                builder.storeRef(builder.storeRef(nftItemConfigToCell(src.item))); // nft_content
            },
            parse(src: Slice): BatchConfig {
                console.log('parse');
                const amount = src.loadCoins();
                const item = src.loadRef().asSlice();
                const ownerAddress = item.loadAddress();
                const content = item.loadRef();
                return { amount, item: { ownerAddress, content } };
            },
        };

        const content = Dictionary.empty(Dictionary.Keys.Uint(64), MintNftDictValue);
        let index = 1;
        for (const item of config.batch) {
            content.set(++index, item);
        }

        await provider.internal(via, {
            value: config.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 32) // operation code
                .storeUint(config.queryId, 64)
                .storeUint(config.itemIndex, 64)
                .storeDict(content)
                .endCell(),
        });
    }

    async sendChangeOwner(provider: ContractProvider, via: Sender, config: ChangeOwnerConfig): Promise<void> {
        await provider.internal(via, {
            value: config.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(3, 32) //operation
                .storeUint(config.queryId, 64)
                .storeAddress(config.newOwnerAddress)
                .endCell(),
        });
    }

    async getCollectionData(provider: ContractProvider): Promise<CollectionData> {
        const collectionData = await provider.get('get_collection_data', []);
        const stack = await collectionData.stack;
        let nextItem = stack.readBigNumber();
        let content = await stack.readCell();
        let ownerAddress = await stack.readAddress();
        return {
            nextItem,
            content,
            ownerAddress,
        };
    }

    async getItemAddressByIndex(provider: ContractProvider, index: TupleItemInt): Promise<Address> {
        const res = await provider.get('get_nft_address_by_index', [index]);
        const itemAddress = await res.stack.readAddress();
        return itemAddress;
    }

    async getNFTContent(provider: ContractProvider, index: TupleItemInt, cell: TupleItemCell): Promise<Cell> {
        const res = await provider.get('get_nft_content', [index, cell]);
        const itemCell = await res.stack.readCell();
        return itemCell;
    }
}
