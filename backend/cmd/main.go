package cmd

import (
	"fmt"
	_ "net/http/pprof"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	log "github.com/sirupsen/logrus"
	"github.com/tonkeeper/tongo/liteapi"

	"github.com/smhmayboudi/ton-dapp-2/config"
	"github.com/smhmayboudi/ton-dapp-2/handler"
	"github.com/smhmayboudi/ton-dapp-2/service"
)

func main() {
	log.Info("Ton Proof is Running")
	config.LoadConfig()

	e := echo.New()
	e.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
		Skipper:           nil,
		DisableStackAll:   true,
		DisablePrintStack: false,
	}))
	e.Use(middleware.Logger())
	var err error
	service.Networks["-239"], err = liteapi.NewClientWithDefaultMainnet()
	if err != nil {
		log.Fatal(err)
	}
	service.Networks["-3"], err = liteapi.NewClientWithDefaultTestnet()
	if err != nil {
		log.Fatal(err)
	}

	h := handler.NewHandler(config.Proof.PayloadSignatureKey, time.Duration(config.Proof.ProofLifeTimeSec)*time.Second)

	handler.RegisterHandlers(e, h)

	log.Fatal(e.Start(fmt.Sprintf(":%v", config.Config.Port)))
}
