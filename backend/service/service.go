package main

import (
	"context"
	"crypto/ed25519"
	"fmt"
	"math/big"

	"github.com/tonkeeper/tongo"
	"github.com/tonkeeper/tongo/abi"
	"github.com/tonkeeper/tongo/liteapi"

	"github.com/smhmayboudi/ton-dapp-2/datatype"
)

var networks = map[string]*liteapi.Client{}

func GetAccountInfo(ctx context.Context, address tongo.AccountID, net *liteapi.Client) (*datatype.AccountInfo, error) {
	account, err := net.GetAccountState(ctx, address)
	if err != nil {
		return nil, err
	}
	accountInfo := datatype.AccountInfo{
		Balance: int64(account.Account.Account.Storage.Balance.Grams),
		Status:  string(account.Account.Status()),
	}
	accountInfo.Address.Raw = address.ToRaw()
	accountInfo.Address.Bounceable = address.ToHuman(true, false)
	accountInfo.Address.NonBounceable = address.ToHuman(false, false)

	return &accountInfo, nil
}

func GetWalletPubKey(ctx context.Context, address tongo.AccountID, net *liteapi.Client) (ed25519.PublicKey, error) {
	_, result, err := abi.GetPublicKey(ctx, net, address)
	if err != nil {
		return nil, err
	}
	if r, ok := result.(abi.GetPublicKeyResult); ok {
		i := big.Int(r.PublicKey)
		b := i.Bytes()
		if len(b) < 24 || len(b) > 32 {
			return nil, fmt.Errorf("invalid publock key")
		}
		//make padding if first bytes are empty
		return append(make([]byte, 32-len(b)), b...), nil
	}
	return nil, fmt.Errorf("can't get publick key")
}
