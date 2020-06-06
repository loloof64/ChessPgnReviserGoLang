package main

import (
	"chess-pgn-reviser/text"

	"github.com/leaanthony/mewn"
	"github.com/wailsapp/wails"
)

func main() {

	js := mewn.String("./frontend/dist/app.js")
	css := mewn.String("./frontend/dist/app.css")

	app := wails.CreateApp(&wails.AppConfig{
		Width:  1024,
		Height: 768,
		Title:  "Chess Pgn Reviser",
		JS:     js,
		CSS:    css,
		Colour: "#fff",
	})

	app.Bind(text.NewTextFileManager())
	app.Run()
}
