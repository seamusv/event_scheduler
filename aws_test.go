package main

import (
	"fmt"
	"github.com/apognu/gocal"
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
	"time"
)

func TestBuildDailyEntries(t *testing.T) {
	filename := "/Users/svenasse/Downloads/Sparx Client Events_c_ptf2keaah0dcj7govugrahq17s@group.calendar.google.com.ics"
	fmt.Printf("filename: %s\n", filename)

	f, _ := os.Open(filename)
	defer f.Close()

	start, _ := time.Parse(time.RFC3339, "2021-04-02T11:06:50-07:00")
	end := start.UTC().Round(time.Hour*24).AddDate(0, 1, -start.Day()).Add(-1 * time.Nanosecond)

	c := gocal.NewParser(f)
	c.Start, c.End = &start, &end
	assert.NoError(t, c.Parse())

	entries := BuildDailyEntries(c.Events)
	for _, e := range entries {
		fmt.Printf("%-50s %s - %s  %0.2f\n", e.Name, e.Start, e.Finish, e.Hours)
	}
}
