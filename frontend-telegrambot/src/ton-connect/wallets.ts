import { isWalletInfoRemote, WalletInfoRemote, WalletsListManager } from '@tonconnect/sdk';

// TODO: move it to env
const WALLETS_LIST_CACHE_TTL_MS = 86400000;

const walletsListManager = new WalletsListManager({
	cacheTTLMs: Number(WALLETS_LIST_CACHE_TTL_MS),
});

export async function getWallets(): Promise<WalletInfoRemote[]> {
	console.log('getWallets', isWalletInfoRemote);
	const wallets = await walletsListManager.getWallets();
	return wallets.filter(isWalletInfoRemote);
}

export async function getWalletInfo(walletAppName: string): Promise<WalletInfoRemote | undefined> {
	console.log('getWalletInfo', walletAppName);
	const wallets = await getWallets();
	return wallets.find((wallet) => wallet.appName.toLowerCase() === walletAppName.toLowerCase());
}
