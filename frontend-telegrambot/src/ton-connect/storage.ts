import { IStorage } from '@tonconnect/sdk';
export class TonConnectStorage implements IStorage {
	constructor(
		private readonly KV: KVNamespace,
		private readonly chatId: number,
	) {}

	private getKey(key: string): string {
		console.log('getKey', key);
		return this.chatId.toString() + key;
	}

	removeItem(key: string): Promise<void> {
		key = this.getKey(key);
		console.log('removeItem');
		return this.KV.delete(key);
	}

	setItem(key: string, value: string): Promise<void> {
		key = this.getKey(key);
		console.log('setItem', key, value);
		return this.KV.put(key, value);
	}

	getItem(key: string): Promise<string | null> {
		key = this.getKey(key);
		console.log('getItem', key);
		return this.KV.get(key);
	}
}
