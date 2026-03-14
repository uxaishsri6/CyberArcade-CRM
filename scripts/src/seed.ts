import { db, contactsTable, segmentsTable, campaignsTable, campaignLogsTable, activitiesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const firstNames = ["Ravi", "Priya", "Ananya", "Arjun", "Kavya", "Shreya", "Rohan", "Pooja", "Karthik", "Divya", "Nikhil", "Swati", "Aditya", "Neha", "Vijay", "Sunita", "Rahul", "Meera", "Suresh", "Lakshmi", "Deepak", "Anjali", "Sanjay", "Rekha", "Mohan", "Usha", "Vinod", "Geeta", "Harish", "Shoba"];
const lastNames = ["Sharma", "Patel", "Kumar", "Singh", "Mehta", "Gupta", "Reddy", "Nair", "Joshi", "Iyer", "Rao", "Verma", "Pandey", "Chopra", "Malhotra", "Kapoor", "Bose", "Das", "Ghosh", "Chatterjee"];
const cities = ["Mumbai", "Bangalore", "Delhi", "Chennai", "Hyderabad", "Pune", "Ahmedabad", "Kolkata", "Jaipur", "Kochi"];
const courses = ["Junior Robotics", "Advanced Robotics", "Game Design", "AI & ML Basics", "Coding Fundamentals"];
const sources = ["trial_attendee", "instagram", "facebook", "referral", "walk_in", "website", "sms", "manual"];
const batches = ["Morning Batch A", "Evening Batch B", "Weekend Batch C", "Saturday Special"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(days: number) { return new Date(Date.now() - days * 86400000).toISOString(); }

async function seed() {
  console.log("🌱 Seeding CyberArcade database...");

  // Clear existing data
  await db.execute(sql`TRUNCATE TABLE activities, campaign_logs, campaigns, segments, contacts RESTART IDENTITY CASCADE`);

  const contacts = [];

  // 20 trial attendees (mixed stages)
  for (let i = 0; i < 20; i++) {
    const statuses = ["trial_attended", "interested", "enrolled", "warm_lead"];
    const status = i < 5 ? "enrolled" : i < 10 ? "interested" : i < 15 ? "trial_attended" : "warm_lead";
    contacts.push({
      firstName: firstNames[i],
      lastName: lastNames[i % lastNames.length],
      email: `${firstNames[i].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@gmail.com`,
      phone: `+91 98${randInt(10, 99)} ${randInt(100000, 999999)}`,
      whatsapp: `+91 98${randInt(10, 99)} ${randInt(100000, 999999)}`,
      city: pick(cities),
      source: "trial_attendee" as const,
      status: status as any,
      childName: `${pick(["Aarav", "Vihaan", "Arjun", "Ishaan", "Dev", "Anvi", "Diya", "Sia", "Zara", "Aanya"])} ${lastNames[i % lastNames.length]}`,
      childAge: randInt(7, 14),
      childGrade: `Grade ${randInt(2, 9)}`,
      trialDate: daysAgo(randInt(5, 45)).substring(0, 10),
      trialAttended: true,
      trialBatch: pick(batches),
      enrolledDate: status === "enrolled" ? daysAgo(randInt(1, 20)).substring(0, 10) : null,
      enrolledCourse: status === "enrolled" ? pick(courses) : null,
      tags: status === "enrolled" ? ["enrolled", "high-priority"] : status === "interested" ? ["interested", "follow-up"] : ["trial-done"],
      leadScore: status === "enrolled" ? randInt(80, 100) : status === "interested" ? randInt(60, 85) : randInt(40, 65),
      lastContactedAt: daysAgo(randInt(1, 10)).substring(0, 10),
      notes: `Parent attended trial session. ${status === "enrolled" ? "Successfully enrolled." : "Follow up required."}`,
    });
  }

  // 15 warm leads (Instagram/Facebook)
  for (let i = 0; i < 15; i++) {
    const idx = i + 20;
    const src = i < 8 ? "instagram" : "facebook";
    contacts.push({
      firstName: firstNames[idx % firstNames.length],
      lastName: lastNames[idx % lastNames.length],
      email: `${firstNames[idx % firstNames.length].toLowerCase()}${idx}@${src === "instagram" ? "instagram" : "fb"}.com`,
      phone: `+91 97${randInt(10, 99)} ${randInt(100000, 999999)}`,
      whatsapp: null,
      city: pick(cities),
      source: src as any,
      status: i < 5 ? "warm_lead" : "cold_lead",
      childName: null,
      childAge: randInt(6, 15),
      childGrade: `Grade ${randInt(1, 10)}`,
      trialDate: i < 8 ? daysAgo(randInt(10, 30)).substring(0, 10) : null,
      trialAttended: false,
      trialBatch: null,
      enrolledDate: null,
      enrolledCourse: null,
      tags: [src, "social-media"],
      leadScore: randInt(20, 55),
      lastContactedAt: i < 8 ? daysAgo(randInt(3, 20)).substring(0, 10) : null,
      notes: `Lead from ${src} ad campaign.`,
    });
  }

  // 10 cold leads
  for (let i = 0; i < 10; i++) {
    const idx = i + 35;
    contacts.push({
      firstName: firstNames[idx % firstNames.length],
      lastName: lastNames[idx % lastNames.length],
      email: `cold.lead${idx}@email.com`,
      phone: `+91 96${randInt(10, 99)} ${randInt(100000, 999999)}`,
      whatsapp: null,
      city: pick(cities),
      source: pick(["referral", "walk_in", "sms", "manual"]) as any,
      status: "cold_lead",
      childName: null,
      childAge: randInt(6, 16),
      childGrade: null,
      trialDate: null,
      trialAttended: false,
      trialBatch: null,
      enrolledDate: null,
      enrolledCourse: null,
      tags: ["cold", "needs-nurturing"],
      leadScore: randInt(0, 25),
      lastContactedAt: null,
      notes: null,
    });
  }

  // 5 enrolled
  for (let i = 0; i < 5; i++) {
    const idx = i + 45;
    contacts.push({
      firstName: firstNames[idx % firstNames.length],
      lastName: lastNames[idx % lastNames.length],
      email: `enrolled.student${idx}@cyberarcade.com`,
      phone: `+91 95${randInt(10, 99)} ${randInt(100000, 999999)}`,
      whatsapp: `+91 95${randInt(10, 99)} ${randInt(100000, 999999)}`,
      city: pick(cities),
      source: pick(["trial_attendee", "referral", "website"]) as any,
      status: "enrolled",
      childName: `Enrolled Kid ${i + 1}`,
      childAge: randInt(8, 13),
      childGrade: `Grade ${randInt(3, 8)}`,
      trialDate: daysAgo(randInt(30, 90)).substring(0, 10),
      trialAttended: true,
      trialBatch: pick(batches),
      enrolledDate: daysAgo(randInt(5, 30)).substring(0, 10),
      enrolledCourse: pick(courses),
      tags: ["enrolled", "active-student"],
      leadScore: randInt(85, 100),
      lastContactedAt: daysAgo(randInt(1, 5)).substring(0, 10),
      notes: "Active student enrolled in full program.",
    });
  }

  const insertedContacts = await db.insert(contactsTable).values(contacts).returning();
  console.log(`✅ Inserted ${insertedContacts.length} contacts`);

  // Add activities
  const activityTypes = ["note", "call", "email_sent", "whatsapp_sent", "status_change", "enrolled"] as const;
  const activities = [];
  for (const c of insertedContacts.slice(0, 30)) {
    const numActs = randInt(1, 4);
    for (let i = 0; i < numActs; i++) {
      const type = activityTypes[randInt(0, activityTypes.length - 1)];
      activities.push({
        contactId: c.id,
        type,
        description: type === "note" ? "Parent showed interest in enrolling. Follow up next week."
          : type === "call" ? "Called parent, discussed program details and pricing."
          : type === "email_sent" ? "Sent program brochure and enrollment details via email."
          : type === "whatsapp_sent" ? "Sent WhatsApp message with trial class schedule."
          : type === "status_change" ? `Status updated to ${c.status}`
          : "Successfully enrolled in the program!",
        createdBy: "Admin",
        createdAt: new Date(Date.now() - randInt(0, 20) * 86400000),
      });
    }
  }
  await db.insert(activitiesTable).values(activities);
  console.log(`✅ Inserted ${activities.length} activities`);

  // 7 predefined segments
  const segments = [
    {
      name: "Trial No-Shows",
      description: "Contacts invited for trial but didn't attend",
      color: "#ff2d78",
      filters: { match: "all", conditions: [{ field: "trialAttended", operator: "equals", value: "false" }, { field: "status", operator: "equals", value: "warm_lead" }] },
    },
    {
      name: "Trial Attended – Not Enrolled",
      description: "Attended trial but not yet enrolled",
      color: "#b44aff",
      filters: { match: "all", conditions: [{ field: "trialAttended", operator: "equals", value: "true" }, { field: "status", operator: "not_equals", value: "enrolled" }] },
    },
    {
      name: "High Intent Parents",
      description: "High lead score, status interested",
      color: "#00f5ff",
      filters: { match: "all", conditions: [{ field: "leadScore", operator: "greater_than", value: "70" }, { field: "status", operator: "equals", value: "interested" }] },
    },
    {
      name: "Instagram Leads",
      description: "All leads acquired from Instagram",
      color: "#ffe033",
      filters: { match: "all", conditions: [{ field: "source", operator: "equals", value: "instagram" }] },
    },
    {
      name: "Facebook Ad Leads",
      description: "All leads from Facebook ads",
      color: "#00ff88",
      filters: { match: "all", conditions: [{ field: "source", operator: "equals", value: "facebook" }] },
    },
    {
      name: "Cold Outreach Pool",
      description: "Cold leads never contacted",
      color: "#8888bb",
      filters: { match: "all", conditions: [{ field: "status", operator: "equals", value: "cold_lead" }] },
    },
    {
      name: "Re-Engagement",
      description: "Trial/interested leads not contacted in 30+ days",
      color: "#ff6b35",
      filters: { match: "any", conditions: [{ field: "status", operator: "equals", value: "trial_attended" }, { field: "status", operator: "equals", value: "interested" }] },
    },
  ];

  const insertedSegments = await db.insert(segmentsTable).values(
    segments.map(s => ({
      ...s,
      contactCount: randInt(5, 20),
    }))
  ).returning();
  console.log(`✅ Inserted ${insertedSegments.length} segments`);

  // 3 sample campaigns
  const campaignData = [
    {
      name: "June Trial Conversion Drive",
      goal: "enroll_trial",
      status: "active",
      channels: ["email", "whatsapp"],
      segmentId: insertedSegments[1].id,
      scheduledAt: daysAgo(-3),
      subject: "Your child's robotics journey starts here! 🤖",
      messageBody: "Hi {{firstName}}, {{childName}} showed amazing interest at the trial. Enroll today!",
      ctaText: "Enroll Now",
      ctaUrl: "https://cyberarcade.in/enroll",
      sentCount: 45,
      openCount: 18,
      clickCount: 9,
      replyCount: 4,
      conversionCount: 3,
    },
    {
      name: "Instagram Re-engagement Campaign",
      goal: "re_engage",
      status: "completed",
      channels: ["instagram", "email"],
      segmentId: insertedSegments[3].id,
      scheduledAt: daysAgo(15),
      subject: "We miss you! Come build your first robot 🤖",
      messageBody: "Hi {{firstName}}, you showed interest in CyberArcade. We have exciting new batches!",
      ctaText: "Book a Free Trial",
      ctaUrl: "https://cyberarcade.in/trial",
      sentCount: 120,
      openCount: 48,
      clickCount: 22,
      replyCount: 8,
      conversionCount: 5,
    },
    {
      name: "New Batch Announcement - July",
      goal: "batch_announce",
      status: "draft",
      channels: ["email", "whatsapp", "sms"],
      segmentId: insertedSegments[0].id,
      scheduledAt: daysAgo(-7),
      subject: "New July batches are LIVE! Seats filling fast 🚀",
      messageBody: "{{firstName}}, our July batch kicks off soon. Register your child {{childName}} today!",
      ctaText: "Reserve Your Seat",
      ctaUrl: "https://cyberarcade.in/july-batch",
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      replyCount: 0,
      conversionCount: 0,
    },
  ];

  const insertedCampaigns = await db.insert(campaignsTable).values(campaignData).returning();
  console.log(`✅ Inserted ${insertedCampaigns.length} campaigns`);

  // Add campaign logs for active and completed campaigns
  const logValues = [];
  for (const camp of insertedCampaigns.slice(0, 2)) {
    for (const contact of insertedContacts.slice(0, 20)) {
      for (const channel of (camp.channels ?? [])) {
        const isOpened = Math.random() > 0.6;
        const isClicked = isOpened && Math.random() > 0.65;
        const isConverted = isClicked && Math.random() > 0.75;
        logValues.push({
          campaignId: camp.id,
          contactId: contact.id,
          channel,
          status: isConverted ? "converted" : isClicked ? "clicked" : isOpened ? "opened" : "delivered",
          sentAt: daysAgo(randInt(5, 20)),
          openedAt: isOpened ? daysAgo(randInt(1, 5)) : null,
          clickedAt: isClicked ? daysAgo(randInt(1, 3)) : null,
          convertedAt: isConverted ? daysAgo(randInt(0, 2)) : null,
        });
      }
    }
  }
  if (logValues.length > 0) {
    await db.insert(campaignLogsTable).values(logValues);
    console.log(`✅ Inserted ${logValues.length} campaign logs`);
  }

  console.log("🎉 Seed complete! CyberArcade is ready for launch.");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
