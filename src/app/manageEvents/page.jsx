"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Modal,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns"; // for date formatting

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    reminder: false,
  });

  useEffect(() => {
    // Fetch events when the component mounts
    axios
      .get("/api/events")
      .then((response) => setEvents(response.data))
      .catch((error) => {
        console.error("Error fetching events:", error);
        alert("Failed to fetch events. Please try again later.");
      });
  }, []);

  const handleOpen = (event = null) => {
    setCurrentEvent(
      event || { title: "", description: "", date: new Date(), reminder: false }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setCurrentEvent({
      title: "",
      description: "",
      date: new Date(),
      reminder: false,
    });
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      if (currentEvent.id) {
        // Update existing event
        const updatedEvent = await axios.put(
          `/api/events/${currentEvent.id}`,
          currentEvent
        );
        setEvents((prev) =>
          prev.map((evt) =>
            evt.id === currentEvent.id ? updatedEvent.data : evt
          )
        );
      } else {
        // Create new event
        const newEvent = await axios.post("/api/events", currentEvent);
        setEvents((prev) => [...prev, newEvent.data]);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/events/${id}`);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const toggleReminder = async (event) => {
    try {
      const updatedEvent = { ...event, reminder: !event.reminder };
      await axios.put(`/api/events/${event.id}`, updatedEvent);
      setEvents((prev) =>
        prev.map((evt) => (evt.id === event.id ? updatedEvent : evt))
      );
    } catch (error) {
      console.error("Error toggling reminder:", error);
      alert("Failed to update reminder. Please try again.");
    }
  };

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Manage Your Events
        </Typography>
        <Box mt={4}>
          <Card onClick={() => handleOpen()} sx={{ cursor: "pointer" }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Add New Event
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click here to add a new event.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Your Events
          </Typography>
          <List>
            {events.length === 0 ? (
              <Typography variant="body1">No events available.</Typography>
            ) : (
              events.map((event) => (
                <ListItem key={event.id} button>
                  <ListItemText
                    primary={event.title}
                    secondary={format(new Date(event.date), "PPPP")} // format the date
                  />
                  <Box display="flex" alignItems="center">
                    <IconButton edge="end" onClick={() => handleOpen(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(event.id)}>
                      <Delete />
                    </IconButton>
                    <Checkbox
                      edge="end"
                      checked={event.reminder}
                      onChange={() => toggleReminder(event)}
                    />
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}>
          <Typography variant="h6" component="h2">
            {currentEvent.id ? "Edit Event" : "Create Event"}
          </Typography>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={currentEvent.title}
            onChange={(e) =>
              setCurrentEvent({ ...currentEvent, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            value={currentEvent.description}
            onChange={(e) =>
              setCurrentEvent({ ...currentEvent, description: e.target.value })
            }
          />
          <DatePicker
            selected={currentEvent.date}
            onChange={(date) =>
              setCurrentEvent({ ...currentEvent, date: date })
            }
            customInput={<TextField fullWidth margin="normal" />}
          />
          <Box mt={2}>
            <Checkbox
              checked={currentEvent.reminder}
              onChange={() =>
                setCurrentEvent({
                  ...currentEvent,
                  reminder: !currentEvent.reminder,
                })
              }
            />
            <Typography variant="body2" component="span">
              Set Reminder
            </Typography>
          </Box>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}
