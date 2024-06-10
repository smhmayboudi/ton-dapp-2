import { pseudoRandomBytes } from 'crypto';
import { Address, BitBuilder, BitReader, Cell, beginCell } from '@ton/ton';

const OFF_CHAIN_CONTENT_PREFIX = 0x01
const ON_CHAIN_CONTENT_PREFIX = 0x00

/**
 *
 * @param cell data
 * @returns
 */
const flattenSnakeCell = function (cell: Cell): Buffer {
	let c: Cell | null = cell;

	const bitResult = new BitBuilder();
	while (c) {
		const cs = c.beginParse();
		if (cs.remainingBits === 0) {
			break;
		}

		const data = cs.loadBits(cs.remainingBits);
		bitResult.writeBits(data);
		c = c.refs && c.refs[0];
	}

	const endBits = bitResult.build();
	const reader = new BitReader(endBits);

	return reader.loadBuffer(reader.remaining / 8);
};

/**
 *
 * @param buff data
 * @param chunkSize size of cell
 * @returns
 */
function bufferToChunks(buff: Buffer, chunkSize: number): Buffer[] {
	let chunks: Buffer[] = [];
	while (buff.byteLength > 0) {
		chunks.push(buff.subarray(0, chunkSize));
		buff = buff.subarray(chunkSize);
	}
	return chunks;
}

/**
 *
 * @param cell data
 * @param chainContextPrefix 0x00 is on-chain and 0x01 is off-chain
 * @returns
 */
const encodeChainContent = function (cell: string, chainContextPrefix: number): Cell {
	let data = Buffer.from(cell);
	let offChainPrefix = Buffer.from([chainContextPrefix]);
	data = Buffer.concat([offChainPrefix, data]);
	return makeSnakeCell(data);
};

const encodeOnChainContent = (content: string): Cell => encodeChainContent(content, ON_CHAIN_CONTENT_PREFIX);
const encodeOffChainContent = (content: string): Cell => encodeChainContent(content, OFF_CHAIN_CONTENT_PREFIX);

/**
 *
 * @param cell data
 * @param chainContextPrefix 0x00 is on-chain and 0x01 is off-chain
 * @returns
 */
const decodeChainContent = function (cell: Cell, chainContextPrefix: number): string {
	let data = flattenSnakeCell(cell);

	let prefix = data[0];
	if (prefix !== chainContextPrefix) {
		throw new Error(`Unknown content prefix: ${prefix.toString(16)}`);
	}
	return data.subarray(1).toString();
};

const decodeOnChainContent = (content: Cell): string => decodeChainContent(content, ON_CHAIN_CONTENT_PREFIX);
const decodeOffChainContent = (content: Cell): string => decodeChainContent(content, OFF_CHAIN_CONTENT_PREFIX);

const makeSnakeCell = function (data: Buffer): Cell {
	const chunks = bufferToChunks(data, 127);

	if (chunks.length === 0) {
		return beginCell().endCell();
	}

	if (chunks.length === 1) {
		return beginCell().storeBuffer(chunks[0]).endCell();
	}

	let curCell = beginCell();

	for (let i = chunks.length - 1; i >= 0; i--) {
		const chunk = chunks[i];

		curCell.storeBuffer(chunk);

		if (i - 1 >= 0) {
			const nextCell = beginCell();
			nextCell.storeRef(curCell);
			curCell = nextCell;
		}
	}

	return curCell.endCell();
};

const randomAddress = function () {
	return new Address(0, pseudoRandomBytes(256 / 8));
};

const unixNow = function () {
	return Math.floor(Date.now() / 1000);
};

export {
	decodeOffChainContent,
	decodeOnChainContent,
	encodeOffChainContent,
	encodeOnChainContent,
	flattenSnakeCell,
	makeSnakeCell,
	randomAddress,
	unixNow,
};
