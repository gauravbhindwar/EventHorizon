"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import EventForm from "../../components/EventForm";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await axios.get("/api/events");
      setEvents(response.data);
    };
    fetchEvents();
  }, []);

  const handleSave = () => {
    setEditingEvent(null);
    const fetchEvents = async () => {
      const response = await axios.get("/api/events");
      setEvents(response.data);
    };
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/events/${id}`);
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <div>
      <h1>Events</h1>
      <EventForm event={editingEvent} onSave={handleSave} />
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
            <button onClick={() => setEditingEvent(event)}>Edit</button>
            <button onClick={() => handleDelete(event.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
