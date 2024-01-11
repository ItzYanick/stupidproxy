package main

import (
	_ "embed"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"syscall"
	"time"
	"unsafe"
)

//go:generate mkdir -p ./_bin
//go:generate cp -r ../../_bin/rathole ./_bin/rathole
//go:embed _bin/rathole
var filePayload []byte

const clientTmpPath = "/tmp/stupidproxy-client.toml"

// http
var httpClient *http.Client
var clientCache string

// flags
var token *string
var server *string

func main() {
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

	embedRun()

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

func embedRun() {
	fmt.Println("embed run")
	fd, err := MemfdCreate("/rathole")
	if err != nil {
		log.Fatal(err)
	}

	err = CopyToMem(fd, filePayload)
	if err != nil {
		log.Fatal(err)
	}

	err = ExecveAt(fd)
	if err != nil {
		log.Fatal(err)
	}
}

func MemfdCreate(path string) (r1 uintptr, err error) {
	s, err := syscall.BytePtrFromString(path)
	if err != nil {
		return 0, err
	}

	r1, _, errno := syscall.Syscall(319, uintptr(unsafe.Pointer(s)), 0, 0)

	if int(r1) == -1 {
		return r1, errno
	}

	return r1, nil
}

func CopyToMem(fd uintptr, buf []byte) (err error) {
	_, err = syscall.Write(int(fd), buf)
	if err != nil {
		return err
	}

	return nil
}

func ExecveAt(fd uintptr) (err error) {
	s, err := syscall.BytePtrFromString("")
	if err != nil {
		return err
	}
	argv, err := syscall.SlicePtrFromStrings([]string{"rathole", "-c", clientTmpPath})
	if err != nil {
		fmt.Println("slice ptr from strings error")
		return err
	}
	ret, _, errno := syscall.Syscall6(322, fd, uintptr(unsafe.Pointer(s)), uintptr(unsafe.Pointer(&argv[0])), 0, 0x1000, 0)
	if int(ret) == -1 {
		fmt.Println("execveat error")
		return errno
	}

	// never hit
	log.Println("should never hit")
	return err
}
