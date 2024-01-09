package main

import (
	_ "embed"
	"fmt"
	"log"
	"syscall"
	"unsafe"
)

//go:generate mkdir -p ./_bin
//go:generate cp -r ../../_bin/rathole ./_bin/rathole
//go:embed _bin/rathole
var filePayload []byte

func EmbedRun() {
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
