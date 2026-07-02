package main

import "testing"

func TestBrowserLaunchCandidatesPreferAppWindowOnWindows(t *testing.T) {
	candidates := browserLaunchCandidates("windows", "http://127.0.0.1:1234")

	if len(candidates) < 3 {
		t.Fatalf("expected app-window candidates plus a fallback, got %d", len(candidates))
	}
	if candidates[0].name != "msedge" {
		t.Fatalf("expected Edge app window first, got %q", candidates[0].name)
	}
	if candidates[0].args[0] != "--app=http://127.0.0.1:1234" {
		t.Fatalf("expected Edge to launch with --app url, got %q", candidates[0].args[0])
	}
	if candidates[len(candidates)-1].name != "rundll32" {
		t.Fatalf("expected rundll32 default-browser fallback last, got %q", candidates[len(candidates)-1].name)
	}
}
