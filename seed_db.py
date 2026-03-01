import psycopg2
import time

DB_PARAMS = dict(
    host="ep-long-block-a4jvg4fm-pooler.us-east-1.aws.neon.tech",
    port=5432,
    user="neondb_owner",
    password="npg_yq8MSdUrmIw3",
    dbname="neondb",
    sslmode="require",
    connect_timeout=30,
)

def get_conn():
    for attempt in range(5):
        try:
            return psycopg2.connect(**DB_PARAMS)
        except psycopg2.OperationalError as e:
            print(f"  [conn retry {attempt+1}] {e}")
            time.sleep(3)
    raise RuntimeError("Could not connect after 5 attempts")

def run_with_retry(fn, *args, retries=3):
    for attempt in range(retries):
        try:
            return fn(*args)
        except psycopg2.OperationalError as e:
            print(f"  [op retry {attempt+1}] {e}")
            time.sleep(2)
    raise RuntimeError("Operation failed after retries")

# ── 1. Admin update ─────────────────────────────────────────────────────────
conn = get_conn()
cur = conn.cursor()
cur.execute("UPDATE users SET role='admin' WHERE email='admin@eventbook.com'")
print(f"Admin updated: {cur.rowcount} rows")
conn.commit()

# ── 2. Wipe old events ───────────────────────────────────────────────────────
cur.execute("DELETE FROM seats WHERE event_id IN (SELECT id FROM events)")
cur.execute("DELETE FROM events")
conn.commit()
print("Old events cleared.")
conn.close()

events = [
    ("Sunburn Music Festival 2026","Asia's biggest EDM festival with world-class DJs, laser shows, and unforgettable performances.","Pune, Maharashtra","2026-03-20","18:00",360,"Music",5000,1499.0,"Sunburn Events","https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"),
    ("IPL 2026 — Mumbai vs Chennai","Watch Mumbai Indians vs Chennai Super Kings at Wankhede. Premium hospitality available.","Wankhede Stadium, Mumbai","2026-04-10","19:30",240,"Sports",1200,2499.0,"BCCI","https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"),
    ("Google I/O Extended Bangalore 2026","The ultimate dev conference: keynotes, workshops, Google product showcases and networking.","NIMHANS Convention Centre, Bangalore","2026-05-15","09:00",480,"Tech",800,999.0,"Google Developers Group","https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"),
    ("Zakir Khan Live — Sakht Launda Tour","India's favourite comedian brings his new stand-up special to Delhi. Pure desi comedy.","Siri Fort Auditorium, Delhi","2026-04-25","20:00",150,"Comedy",600,799.0,"Canvas Laugh Club","https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800"),
    ("Kala Ghoda Arts Festival 2026","Mumbai's iconic 9-day arts festival: visual arts, music, dance, theatre, and literature.","Kala Ghoda, Mumbai","2026-03-05","11:00",600,"Art",2000,299.0,"Kala Ghoda Association","https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800"),
    ("Chef Table Experience Mumbai","8-course dinner by Ranveer Brar exploring Indian regional cuisines with wine pairings.","Taj Hotels, Mumbai","2026-06-20","19:00",180,"Food",120,3999.0,"Culinary India","https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"),
    ("Startup Summit India 2026","200+ speakers, investor pitches, product demos. For founders, investors, and innovators.","Pragati Maidan, Delhi","2026-07-18","08:30",540,"Business",3000,1999.0,"StartupIndia","https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800"),
    ("Yoga Wellness Retreat Rishikesh","Full-day yoga retreat by the Ganges: pranayama, meditation, Ayurvedic meals, sound healing.","Rishikesh, Uttarakhand","2026-03-28","06:00",720,"Health",150,2499.0,"Ananda Wellness","https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800"),
    ("GATE 2026 Crash Course — IIT Alumni","Intensive GATE preparation workshop by IIT alumni. Electronics, CS, Mechanical with mock tests.","IIT Mumbai Campus","2026-05-02","09:00",960,"Education",500,1199.0,"EduElite","https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800"),
    ("Coldplay — Music of the Spheres Tour","Coldplay's iconic concert with spectacular light shows, confetti cannons, LED wristbands.","D.Y. Patil Stadium, Mumbai","2026-12-05","17:00",180,"Music",80000,4999.0,"BookMyShow Live","https://images.unsplash.com/photo-1501386761578-eee49e3d3ee0?w=800"),
    ("React India Conference 2026","Largest React.js conference in Asia: React 19, Next.js workshops, open source contributions.","HICC, Hyderabad","2026-08-14","09:30",480,"Tech",2000,2999.0,"React India","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"),
    ("Arijit Singh Live — Aashiqui Night","Intimate acoustic concert: Tum Hi Ho, Kabira, and Channa Mereya live by Bollywood's best voice.","Andheri Sports Complex, Mumbai","2026-09-19","19:00",210,"Music",10000,1999.0,"Live Nation India","https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"),
]

L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
SEAT_BATCH = 20  # insert seats in small batches to avoid Neon connection drops

# ── 3. Insert each event in its own connection ───────────────────────────────
for title, desc, loc, date, etime, dur, cat, seats, price, org, banner in events:
    conn = get_conn()
    cur = conn.cursor()
    # Insert event
    cur.execute(
        "INSERT INTO events (title,description,location,event_date,event_time,duration_mins,category,total_seats,available_seats,capacity,price,organizer,banner_url,status,created_at,updated_at) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'available',NOW(),NOW()) RETURNING id",
        (title, desc, loc, date, etime, dur, cat, seats, seats, seats, price, org, banner)
    )
    eid = cur.fetchone()[0]

    # Build seat list
    nr = min(max(seats // 10, 5), 26)
    seat_rows = [(eid, f"{L[r]}{c}", False) for r in range(nr) for c in range(1, 11)]

    # Insert seats in small batches
    for i in range(0, len(seat_rows), SEAT_BATCH):
        batch = seat_rows[i:i + SEAT_BATCH]
        cur.executemany("INSERT INTO seats (event_id,seat_number,is_booked) VALUES (%s,%s,%s)", batch)

    conn.commit()
    conn.close()
    print(f"[OK] {title[:40]:40s} ID={eid} seats={len(seat_rows)}")
    time.sleep(0.3)  # small pause between events to be gentle on Neon

print("Seeding complete!")
