package main

import (
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const clientTmpPath = "/tmp/stupidproxy-client.toml"

// http
var httpClient *http.Client
var clientCache string

// flags
var token *string
var server *string

func main() {
	token = flag.String("token", "", "(required) Token used to authenticate with the server")
	server = flag.String("server", "", "(required) Server address\n\tExample: https://example.com:8080")
	var help = flag.Bool("help", false, "Show help")

	flag.Parse()

	if *help {
		flag.Usage()
		return
	}

	if *server == "" {
		fmt.Println("Server is required")
		fmt.Println("")
		flag.Usage()
		return
	}

	if *token == "" {
		fmt.Println("Token is required")
		fmt.Println("")
		flag.Usage()
		return
	}

	httpClient = &http.Client{}
	clientCache = ""

	get()

	go func() {
		for {
			time.Sleep(30 * time.Second)
			get()
		}
	}()

	fmt.Println("Starting tunnel")

	EmbedRun()

}

func get() {
	req, err := http.NewRequest("GET", *server+"/api/v1/clientOnly/generate", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	req.Header.Add("x-token", *token)
	resp, err := httpClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	if clientCache != string(body) {
		clientCache = string(body)
		fmt.Println("New client received")
		// print to file
		if err = os.WriteFile(clientTmpPath, body, 0644); err != nil {
			fmt.Println(err)
			return
		}
	}
}
