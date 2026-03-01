package main

import (
	"fmt"
	"log"
	"time"

	"event-booking-backend/internal/config"
	"event-booking-backend/internal/models"
)

func main() {
	db := config.ConnectDB()

	db.AutoMigrate(&models.Event{}, &models.User{}, &models.Seat{})

	
	db.Exec("UPDATE users SET role='admin' WHERE email='admin@eventbook.com'")
	fmt.Println("✓ Admin role updated")

	
	var count int64
	db.Model(&models.Event{}).Where("title != 'dfghtyjtuky'").Count(&count)
	if count >= 10 {
		fmt.Printf("Already have %d events, skipping seed.\n", count)
		return
	}

	parseDate := func(s string) time.Time {
		t, err := time.Parse("2006-01-02", s)
		if err != nil {
			log.Fatal(err)
		}
		return t
	}

	type es struct {
		Title, Desc, Location, Date, EventTime, Category, Organizer, Banner string
		Dur, Seats                                                          int
		Price                                                               float64
	}
	data := []es{
		{"Sunburn Music Festival 2025", "Asia's biggest EDM festival with world-class DJs, laser shows, and unforgettable performances.", "Pune, Maharashtra", "2025-03-15", "18:00", "Music", "Sunburn Events", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", 360, 5000, 1499},
		{"IPL Fever — Mumbai vs Chennai", "Watch Mumbai Indians vs Chennai Super Kings at Wankhede. Premium hospitality available.", "Wankhede Stadium, Mumbai", "2025-04-05", "19:30", "Sports", "BCCI", "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800", 240, 1200, 2499},
		{"Google I/O Extended Bangalore", "The ultimate dev conference: keynotes, workshops, Google product showcases and networking.", "NIMHANS Convention Centre, Bangalore", "2025-05-10", "09:00", "Tech", "Google Developers Group", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", 480, 800, 999},
		{"Zakir Khan Live — Sakht Launda Tour", "India's favourite comedian brings his new stand-up special to Delhi. Pure desi comedy.", "Siri Fort Auditorium, Delhi", "2025-05-22", "20:00", "Comedy", "Canvas Laugh Club", "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800", 150, 600, 799},
		{"Kala Ghoda Arts Festival", "Mumbai's iconic 9-day arts festival: visual arts, music, dance, theatre, and literature.", "Kala Ghoda, Mumbai", "2025-02-28", "11:00", "Art", "Kala Ghoda Association", "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800", 600, 2000, 299},
		{"Chef Table Experience Mumbai", "8-course dinner by Ranveer Brar exploring Indian regional cuisines with wine pairings.", "Taj Hotels, Mumbai", "2025-06-14", "19:00", "Food", "Culinary India", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", 180, 120, 3999},
		{"Startup Summit India 2025", "200+ speakers, investor pitches, product demos. For founders, investors, and innovators.", "Pragati Maidan, Delhi", "2025-07-18", "08:30", "Business", "StartupIndia", "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800", 540, 3000, 1999},
		{"Yoga Wellness Retreat Rishikesh", "Full-day yoga retreat by the Ganges: pranayama, meditation, Ayurvedic meals, sound healing.", "Rishikesh, Uttarakhand", "2025-03-30", "06:00", "Health", "Ananda Wellness", "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800", 720, 150, 2499},
		{"GATE Crash Course IIT Alumni", "Intensive GATE workshop by IIT alumni covering Electronics, CS, Mechanical with mock tests.", "IIT Mumbai Campus", "2025-04-20", "09:00", "Education", "EduElite", "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800", 960, 500, 1199},
		{"Coldplay Music of Spheres Tour", "Coldplay's iconic concert: light shows, confetti cannons, LED wristbands, epic setlist.", "D.Y. Patil Stadium, Mumbai", "2025-01-19", "17:00", "Music", "BookMyShow Live", "https://images.unsplash.com/photo-1501386761578-eee49e3d3ee0?w=800", 180, 80000, 4999},
		{"React India Conference 2025", "Largest React.js conference in Asia: React 19, Next.js workshops, open source. Limited seats.", "HICC, Hyderabad", "2025-08-08", "09:30", "Tech", "React India", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", 480, 2000, 2999},
		{"Arijit Singh Live Aashiqui Night", "Intimate acoustic concert: Tum Hi Ho, Kabira, Channa Mereya live by Bollywood's best voice.", "Andheri Sports Complex, Mumbai", "2025-09-13", "19:00", "Music", "Live Nation India", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", 210, 10000, 1999},
	}
	events := make([]models.Event, 0, len(data))
	for _, d := range data {
		events = append(events, models.Event{
			Title: d.Title, Description: d.Desc, Location: d.Location,
			EventDate: parseDate(d.Date), EventTime: d.EventTime, DurationMins: d.Dur,
			Category: d.Category, TotalSeats: d.Seats, AvailableSeats: d.Seats, Capacity: d.Seats,
			Price: d.Price, Organizer: d.Organizer, BannerURL: d.Banner, Status: "available",
		})
	}

	for _, e := range events {
		if err := db.Create(&e).Error; err != nil {
			log.Printf("failed to create event %s: %v", e.Title, err)
			continue
		}

		
		var seats []models.Seat
		rows := (e.TotalSeats / 10)
		if rows > 50 {
			rows = 50
		}
		if rows < 5 {
			rows = 5
		}
		cols := 10
		rowLetters := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		for r := 0; r < rows; r++ {
			for c := 1; c <= cols; c++ {
				seats = append(seats, models.Seat{
					EventID:    e.ID,
					SeatNumber: fmt.Sprintf("%c%d", rowLetters[r], c),
					IsBooked:   false,
				})
			}
		}
		if len(seats) > 0 {
			db.CreateInBatches(seats, 100)
		}
		fmt.Printf("✓ Created event: %s (ID: %d, seats: %d)\n", e.Title, e.ID, len(seats))
	}

	fmt.Println("\n✅ Seeding complete!")
}
