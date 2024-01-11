package main

import (
	_ "embed"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"
)

//go:generate mkdir -p ./_bin
//go:generate cp -r ../../_bin/rathole ./_bin/rathole
//go:embed _bin/rathole
var filePayload []byte

const clientPath = "/tmp/stupidproxy/rathole"
const clientTmpPath = "/tmp/stupidproxy/client.toml"

// http
var httpClient *http.Client
var clientCache string

// flags
var token *string
var server *string

func debug(message string) {
	if os.Getenv("STUPIDPROXY_DEBUG") == "" {
		return
	}
	fmt.Println("DEBUG: " + message)
}

func main() {
	defer cleanup()

	server = flag.String("server", os.Getenv("STUPIDPROXY_SERVER"), "(required) Server address\n\tExample: https://example.com:8080")
	token = flag.String("token", os.Getenv("STUPIDPROXY_TOKEN"), "(required) Token used to authenticate with the server")
	help := flag.Bool("help", false, "Show help")

	flag.Parse()

	if *help {
		flag.Usage()
		return
	}

	// this is a hack to wait for the server to be ready
	if os.Getenv("STUPIDPROXY_WAIT") != "" {
		time.Sleep(1 * time.Second)
	}

	if *server == "" {
		fmt.Println("ERROR: Server is required")
		fmt.Println("")
		flag.Usage()
		return
	}

	if *token == "" {
		fmt.Println("ERROR: Token is required")
		fmt.Println("")
		flag.Usage()
		return
	}

	httpClient = &http.Client{}
	clientCache = ""

	get()

	go func() {
		for {
			debug("Sleeping for 10 seconds")
			time.Sleep(10 * time.Second)
			debug("Done sleeping")
			get()
			debug("Done getting")
		}
	}()

	fmt.Println("INFO: Starting tunnel")

	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		cleanup()
		os.Exit(1)
	}()

	exportBin()
	startBin()
	fmt.Println("exit?")
}

func cleanup() {
	fmt.Println("INFO: Exiting tunnel")
	if err := os.Remove(clientTmpPath); err != nil {
		fmt.Println(err)
	}
	if err := os.Remove(clientPath); err != nil {
		fmt.Println(err)
	}
}

func get() {
	debug("Getting config from server")
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
		fmt.Println("INFO: New client config received")
		// print to file
		if err = os.WriteFile(clientTmpPath, body, 0644); err != nil {
			fmt.Println(err)
			return
		}
	}
}

func exportBin() {
	debug("Exporting bin")
	if err := os.WriteFile(clientPath, filePayload, 0755); err != nil {
		fmt.Println(err)
		return
	}
}

func startBin() {
	debug("Starting bin")
	cmd := exec.Command(clientPath, "-c", clientTmpPath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Println(err)
		return
	}
}
