import TonConnect from '@tonconnect/sdk';
import { TonConnectStorage } from './storage';

const CONNECTOR_TTL_MS = 600000;
const MANIFEST_URL = 'https://raw.githubusercontent.com/smhmayboudi/ton-dapp/main/public/tonconnect-manifest.json';

type StoredConnectorData = {
	connector: TonConnect;
	onConnectorExpired: ((connector: TonConnect) => void)[];
	timeout: ReturnType<typeof setTimeout>;
};

const connectors = new Map<number, StoredConnectorData>();

export function getConnector(KV: KVNamespace, chatId: number, onConnectorExpired?: (connector: TonConnect) => void): TonConnect {
	console.log('getConnector');
	let storedItem: StoredConnectorData;
	if (connectors.has(chatId)) {
		console.log('getConnector connectors.has', chatId);
		storedItem = connectors.get(chatId)!;
		console.log('getConnector connectors.has storedItem', storedItem);
		clearTimeout(storedItem.timeout);
	} else {
		console.log('getConnector !connectors.has', chatId);
		storedItem = {
			connector: new TonConnect({
				// TODO: move it to env
				manifestUrl: MANIFEST_URL,
				storage: new TonConnectStorage(KV, chatId),
			}),
			onConnectorExpired: [],
		} as unknown as StoredConnectorData;
	}

	if (onConnectorExpired) {
		console.log('getConnector onConnectorExpired');
		storedItem.onConnectorExpired.push(onConnectorExpired);
		console.log('getConnector onConnectorExpired', storedItem);
	}

	storedItem.timeout = setTimeout(() => {
		console.log('getConnector storedItem.timeout');
		if (connectors.has(chatId)) {
			console.log('getConnector storedItem.timeout connectors.has', chatId);
			const storedItem = connectors.get(chatId)!;
			storedItem.connector.pauseConnection();
			storedItem.onConnectorExpired.forEach((callback) => callback(storedItem.connector));
			connectors.delete(chatId);
		}
	}, Number(CONNECTOR_TTL_MS)); // TODO: move it to env

	connectors.set(chatId, storedItem);
	return storedItem.connector;
}
