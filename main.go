package main

import (
	"flag"
	"github.com/leaanthony/mewn"
	"github.com/wailsapp/wails"
	"os"
)

var (
	asgName    = flag.String("asg", "sparks-server-prod", "ASG Name")
	awsProfile = flag.String("profile", "sparks", "AWS Profile")
	finishSize = flag.Int64("size", 2, "Server count on finish")
)

func run() error {
	flag.Parse()

	_ = os.Setenv("AWS_SDK_LOAD_CONFIG", "1")
	_ = os.Setenv("AWS_PROFILE", *awsProfile)

	js := mewn.String("./frontend/dist/app.js")
	css := mewn.String("./frontend/dist/app.css")

	autoscaler, err := NewAutoScaler(*asgName, *finishSize)
	if err != nil {
		return err
	}

	app := wails.CreateApp(&wails.AppConfig{
		Width:     1024,
		Height:    768,
		Title:     "AWS Event Scheduler",
		JS:        js,
		CSS:       css,
		Colour:    "#fff",
		Resizable: true,
	})
	app.Bind(autoscaler)
	return app.Run()
}

func main() {
	if err := run(); err != nil {
		panic(err)
	}
}
