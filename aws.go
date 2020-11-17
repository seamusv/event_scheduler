package main

import (
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/autoscaling"
	"github.com/mitchellh/mapstructure"
	"github.com/wailsapp/wails"
	"math/rand"
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
		Name    string `json:"name"`
		Start   string `json:"start"`
		Finish  string `json:"finish"`
		Servers int64  `json:"servers"`
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
