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
	for _, candidate := range browserLaunchCandidates(runtime.GOOS, url) {
		if err := exec.Command(candidate.name, candidate.args...).Start(); err == nil {
			return
		}
	}
}

type launchCandidate struct {
	name string
	args []string
}

func browserLaunchCandidates(goos string, url string) []launchCandidate {
	switch goos {
	case "windows":
		appArg := "--app=" + url
		return []launchCandidate{
			{name: "msedge", args: []string{appArg}},
			{name: "chrome", args: []string{appArg}},
			{name: "rundll32", args: []string{"url.dll,FileProtocolHandler", url}},
		}
	case "darwin":
		return []launchCandidate{{name: "open", args: []string{url}}}
	default:
		return []launchCandidate{{name: "xdg-open", args: []string{url}}}
	}
}
