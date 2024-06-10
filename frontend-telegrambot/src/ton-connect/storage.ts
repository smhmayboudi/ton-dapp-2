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

	async removeItem(key: string): Promise<void> {
		key = this.getKey(key);
		console.log('removeItem');
		await this.KV.delete(key);
		console.log('removeItem done');
	}

	async setItem(key: string, value: string): Promise<void> {
		key = this.getKey(key);
		console.log('setItem', key, value);
		await this.KV.put(key, value);
		console.log('setItem done', key, value);
	}

	async getItem(key: string): Promise<string | null> {
		key = this.getKey(key);
		console.log('getItem', key);
		const value = await this.KV.get(key);
		console.log('getItem done', key, value);
		return value;
	}
}
