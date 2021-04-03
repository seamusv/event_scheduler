package main

import (
	"fmt"
	"github.com/apognu/gocal"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/autoscaling"
	"github.com/mitchellh/mapstructure"
	"github.com/wailsapp/wails"
	"math/rand"
	"os"
	"sort"
	"strings"
	"time"
)

type (
	AutoScaler struct {
		asgName    string
		finishSize int64
		runtime    *wails.Runtime
		svc        *autoscaling.AutoScaling
	}

	Entry struct {
		Name    string  `json:"name"`
		Start   string  `json:"start"`
		Finish  string  `json:"finish"`
		Servers int64   `json:"servers"`
		Hours   float64 `json:"hours"`
	}

	Schedule struct {
		Ids    []string   `json:"ids"`
		Name   string     `json:"name"`
		Size   int64      `json:"size"`
		Start  *time.Time `json:"start"`
		Finish *time.Time `json:"finish"`
		Tz     string     `json:"tz"`
	}
)

func NewAutoScaler(asgName string, finishServerSize int64) (*AutoScaler, error) {
	sess, err := session.NewSession()
	if err != nil {
		return nil, fmt.Errorf("error in creating session: %q", err)
	}

	return &AutoScaler{
		asgName:    asgName,
		finishSize: finishServerSize,
		svc:        autoscaling.New(sess),
	}, nil
}

func (t *AutoScaler) AddSchedule(data map[string]interface{}) error {
	var entry Entry
	if err := mapstructure.Decode(data, &entry); err != nil {
		return err
	}

	return t.addScheduleEntry(entry)
}

func (t *AutoScaler) addScheduleEntry(entry Entry) error {
	start, err := time.Parse(time.RFC3339, entry.Start)
	if err != nil {
		return err
	}
	finish, err := time.Parse(time.RFC3339, entry.Finish)
	if err != nil {
		return err
	}
	tz := start.Format("-0700")
	start = start.Add(time.Second * time.Duration(rand.Int31n(600)-300)).UTC()
	finish = finish.Add(time.Second * time.Duration(rand.Int31n(600)-300)).UTC()

	if err := t.addAWSSchedule(fmt.Sprintf("%s/START/%s", entry.Name, tz), &start, entry.Servers); err == nil {
		if err := t.addAWSSchedule(fmt.Sprintf("%s/FINISH/%s", entry.Name, tz), &finish, t.finishSize); err != nil {
			return err
		}
	} else {
		return err
	}

	return nil
}

func (t *AutoScaler) addAWSSchedule(name string, time *time.Time, servers int64) error {
	input := &autoscaling.PutScheduledUpdateGroupActionInput{
		AutoScalingGroupName: aws.String(t.asgName),
		DesiredCapacity:      aws.Int64(servers),
		MaxSize:              aws.Int64(20),
		MinSize:              aws.Int64(servers),
		ScheduledActionName:  aws.String(name),
		StartTime:            time,
	}

	_, err := t.svc.PutScheduledUpdateGroupAction(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case autoscaling.ErrCodeAlreadyExistsFault:
				fmt.Println(autoscaling.ErrCodeAlreadyExistsFault, aerr.Error())
			case autoscaling.ErrCodeLimitExceededFault:
				fmt.Println(autoscaling.ErrCodeLimitExceededFault, aerr.Error())
			case autoscaling.ErrCodeResourceContentionFault:
				fmt.Println(autoscaling.ErrCodeResourceContentionFault, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}
		return err
	}

	return nil
}

func (t *AutoScaler) DeleteSchedule(data []interface{}) error {
	var ids []string
	if err := mapstructure.Decode(data, &ids); err != nil {
		return err
	}
	return t.deleteSchedules(ids)
}

func (t *AutoScaler) deleteSchedules(ids []string) error {
	for _, id := range ids {
		input := &autoscaling.DeleteScheduledActionInput{
			AutoScalingGroupName: aws.String(t.asgName),
			ScheduledActionName:  aws.String(id),
		}

		_, err := t.svc.DeleteScheduledAction(input)
		if err != nil {
			if aerr, ok := err.(awserr.Error); ok {
				switch aerr.Code() {
				case autoscaling.ErrCodeResourceContentionFault:
					fmt.Println(autoscaling.ErrCodeResourceContentionFault, aerr.Error())
				default:
					fmt.Println(aerr.Error())
				}
			} else {
				// Print the error, cast err to awserr.Error to get the Code and
				// Message from an error.
				fmt.Println(err.Error())
			}
			return err
		}
	}

	return nil
}

func (t *AutoScaler) GetSchedule() ([]Schedule, error) {
	input := &autoscaling.DescribeScheduledActionsInput{
		AutoScalingGroupName: aws.String(t.asgName),
		MaxRecords:           aws.Int64(100),
	}

	result, err := t.svc.DescribeScheduledActions(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case autoscaling.ErrCodeInvalidNextToken:
				fmt.Println(autoscaling.ErrCodeInvalidNextToken, aerr.Error())
			case autoscaling.ErrCodeResourceContentionFault:
				fmt.Println(autoscaling.ErrCodeResourceContentionFault, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}
		return nil, err
	}

	scheduleMap := make(map[string]Schedule)
	for _, schedule := range result.ScheduledUpdateGroupActions {
		if name, state, tz, ok := nameSplitter(*schedule.ScheduledActionName); ok {
			var entry Schedule
			if e, ok := scheduleMap[name]; ok {
				entry = e
			} else {
				entry = Schedule{
					Ids:  []string{},
					Name: name,
					Tz:   tz,
				}
			}
			entry.Ids = append(entry.Ids, *schedule.ScheduledActionName)
			if state == "START" {
				entry.Start = schedule.Time
				entry.Size = *schedule.MinSize
			} else {
				entry.Finish = schedule.Time
			}
			scheduleMap[name] = entry
		}
	}

	schedules := make([]Schedule, 0)
	for _, s := range scheduleMap {
		if s.Size == 0 {
			s.Size = t.finishSize
		}
		schedules = append(schedules, s)
	}
	sort.SliceStable(schedules, func(i, j int) bool {
		if schedules[i].Start == nil || schedules[j].Start == nil {
			return schedules[i].Finish.Unix() < schedules[j].Finish.Unix()
		}

		if schedules[i].Start != nil && schedules[j].Start != nil {
			return schedules[i].Start.Unix() < schedules[j].Start.Unix()
		}

		return false
	})

	return schedules, nil
}

func (t *AutoScaler) ParseICSFile() error {
	filename := t.runtime.Dialog.SelectFile("Select ICS File", "*.ics")
	//filename := "/Users/svenasse/Downloads/Sparx Client Events_c_ptf2keaah0dcj7govugrahq17s@group.calendar.google.com.ics"
	fmt.Printf("filename: %s\n", filename)

	schedules, err := t.GetSchedule()
	if err != nil {
		return err
	}
	for _, schedule := range schedules {
		if err := t.deleteSchedules(schedule.Ids); err != nil {
			return err
		}
	}

	f, _ := os.Open(filename)
	defer f.Close()

	start := time.Now()
	end := start.UTC().Round(time.Hour*24).AddDate(0, 1, -start.Day()).Add(-1 * time.Nanosecond)

	c := gocal.NewParser(f)
	c.Start, c.End = &start, &end
	if err := c.Parse(); err != nil {
		return err
	}

	entries := BuildDailyEntries(c.Events)
	for _, entry := range entries {
		fmt.Printf("%-50s %s - %s  %0.2f\n", entry.Name, entry.Start, entry.Finish, entry.Hours)
		if err := t.addScheduleEntry(entry); err != nil {
			fmt.Printf("ERROR: %v\n", err)
			return err
		}
	}

	return nil
}

func BuildDailyEntries(events []gocal.Event) []Entry {
	var result = make([]Entry, 0)
	sort.Slice(events, func(i, j int) bool {
		return events[i].Start.Before(*events[j].Start)
	})

	var dailyEntries = make([]Entry, 0)
	for _, e := range events {
		if e.End.Sub(*e.Start).Hours() < 23.0 {
			entry := Entry{
				Name:    e.Summary,
				Start:   e.Start.Local().Add(-45 * time.Minute).Format(time.RFC3339),
				Finish:  e.End.Local().Add(45 * time.Minute).Format(time.RFC3339),
				Servers: 4,
			}
			if len(dailyEntries) > 0 {
				start, _ := time.Parse(time.RFC3339, dailyEntries[0].Start)
				if !start.Round(time.Hour * 24).Equal(e.Start.Local().Round(time.Hour * 24)) {
					result = append(result, merge(dailyEntries))
					dailyEntries = make([]Entry, 0)
				}
			}
			dailyEntries = append(dailyEntries, entry)
		}
	}

	if len(dailyEntries) > 0 {
		result = append(result, merge(dailyEntries))
	}

	return result
}

func merge(entries []Entry) Entry {
	genesis := entries[0]
	for i, entry := range entries {
		if i > 0 {
			gStart, _ := time.Parse(time.RFC3339, genesis.Start)
			gEnd, _ := time.Parse(time.RFC3339, genesis.Finish)
			eStart, _ := time.Parse(time.RFC3339, entry.Start)
			eEnd, _ := time.Parse(time.RFC3339, entry.Finish)
			if eStart.Before(gStart) {
				genesis.Start = eStart.Format(time.RFC3339)
			}
			if eEnd.After(gEnd) {
				genesis.Finish = eEnd.Format(time.RFC3339)
			}
			genesis.Name = fmt.Sprintf("%s %s", genesis.Name, entry.Name)
		}
	}
	gStart, _ := time.Parse(time.RFC3339, genesis.Start)
	gFinish, _ := time.Parse(time.RFC3339, genesis.Finish)
	genesis.Name = fmt.Sprintf("%s %s", genesis.Name, gStart.Local().Format("01-02"))
	genesis.Hours = gFinish.Sub(gStart).Hours()
	return genesis
}

func (t *AutoScaler) WailsInit(runtime *wails.Runtime) error {
	t.runtime = runtime
	return nil
}

func nameSplitter(tokenName string) (name string, state string, tz string, ok bool) {
	x := strings.SplitN(tokenName, "/", 3)
	if len(x) != 3 {
		return "", "", "", false
	}
	return x[0], x[1], strings.ReplaceAll(x[2], "/", ":"), true
}
