import commandConnect from './command:connect';
import commandDisconnect from './command:disconnect';
import commandHelp from './command:help';
import commandMyWallet from './command:mywallet';
import commandSendTX from './command:sendtx';
import commandSettings from './command:settings';
import commandStart from './command:start';
import { help } from './command:start';
import use from './use';

const composers = [commandHelp, commandSettings, commandStart, use];

const helps = [help];

export default composers;
export { helps };
