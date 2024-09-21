import { useState } from "react";
import axios from "axios";

export default function EventForm({ event, onSave }) {
  const [title, setTitle] = useState(event ? event.title : "");
  const [description, setDescription] = useState(
    event ? event.description : ""
  );
  const [date, setDate] = useState(event ? event.date : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { title, description, date };
    if (event) {
      await axios.put(`/api/events/${event.id}`, data);
    } else {
      await axios.post("/api/events", data);
    }
    onSave();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
