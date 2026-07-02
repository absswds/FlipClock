package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"time"
)

//go:embed dist
var distDir embed.FS

func main() {
	staticFS, err := fs.Sub(distDir, "dist")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load embedded files: %v\n", err)
		os.Exit(1)
	}

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to open port: %v\n", err)
		os.Exit(1)
	}

	port := listener.Addr().(*net.TCPAddr).Port
	url := fmt.Sprintf("http://127.0.0.1:%d", port)

	handler := http.FileServer(http.FS(staticFS))
	http.Handle("/", handler)

	go openBrowser(url)

	// Brief delay to ensure the server is ready before the browser hits it
	time.Sleep(200 * time.Millisecond)

	fmt.Printf("\n  FlipClock\n")
	fmt.Printf("  Running at %s\n", url)
	fmt.Printf("  Close this window to stop.\n\n")

	if err := http.Serve(listener, nil); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}

func openBrowser(url string) {
	switch runtime.GOOS {
	case "windows":
		exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		exec.Command("open", url).Start()
	default:
		exec.Command("xdg-open", url).Start()
	}
}
