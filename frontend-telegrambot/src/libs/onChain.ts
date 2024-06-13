import { Dictionary, beginCell, Cell } from '@ton/ton';
import { sha256_sync } from '@ton/crypto';

export function toSha256(s: string): bigint {
	return BigInt('0x' + sha256_sync(s).toString('hex'));
}

export function toTextCell(s: string): Cell {
	return beginCell().storeUint(0, 8).storeStringTail(s).endCell();
}

export type content = {
	name: string;
	description: string;
	image: string;
};

export function contentConfigToCell(content: itemContent): Cell {
	const itemContentDict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell())
		.set(toSha256('name'), toTextCell(content.name))
		.set(toSha256('description'), toTextCell(content.description))
		.set(toSha256('image'), toTextCell(content.image));
	return beginCell().storeUint(0, 8).storeDict(itemContentDict).endCell();
}
