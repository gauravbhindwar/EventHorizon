import cron from "node-cron";
import nodemailer from "nodemailer";
import { getEvents } from "./yourEventFetchingFunction"; // Import a function to get upcoming events

const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email
const sendEmail = async (email, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
};

// Schedule a task to run every minute
cron.schedule("* * * * *", async () => {
  const events = await getEvents(); // Fetch upcoming events
  const now = new Date();

  for (const event of events) {
    const eventStart = new Date(event.date);
    const timeDifference = eventStart - now;

    // Check if the event starts in 20 minutes (1200000 milliseconds)
    if (timeDifference <= 1200000 && timeDifference > 0) {
      await sendEmail(
        event.userEmail, // Assuming the event object has the user's email
        "Upcoming Event Reminder",
        `Reminder: You have an event scheduled for ${event.date}.`
      );
    }
  }
});
