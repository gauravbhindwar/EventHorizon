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
  Fab,
  Tooltip,
  Snackbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit, Delete, Add, AlarmOn, AlarmOff } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loader state
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
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
      .then((response) => {
        setEvents(response.data);
        setLoading(false); // Stop loader after fetching
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        alert("Failed to fetch events. Please try again later.");
        setLoading(false); // Stop loader on error
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
      const eventData = {
        title: currentEvent.title,
        description: currentEvent.description,
        date: currentEvent.date.toISOString(),
        reminder: currentEvent.reminder,
      };

      let response;
      if (currentEvent.id) {
        // Update existing event
        response = await axios.put(`/api/events/${currentEvent.id}`, eventData);
        setEvents((prev) =>
          prev.map((evt) => (evt.id === currentEvent.id ? response.data : evt))
        );
        setSnackbarMessage("Event updated successfully!");
      } else {
        // Create new event
        response = await axios.post("/api/events", eventData);
        setEvents((prev) => [...prev, response.data]);
        setSnackbarMessage("Event added successfully!");
      }
      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("An error occurred while saving the event. Please try again.");
    } finally {
      setSnackbarOpen(true); // Show the Snackbar for success message
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/events/${id}`, {
        data: { id },
      });
      if (response.status === 200) {
        setEvents((prev) => prev.filter((event) => event.id !== id));
        setSnackbarMessage("Event deleted successfully!");
      } else {
        console.error("Failed to delete event:", response.statusText);
        alert("Failed to delete event. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setSnackbarOpen(true); // Show Snackbar after deletion
    }
  };

  const toggleReminder = async (event) => {
    try {
      const updatedEvent = { ...event, reminder: !event.reminder };
      await axios.put(`/api/events/${event.id}`, updatedEvent);
      setEvents((prev) =>
        prev.map((evt) => (evt.id === event.id ? updatedEvent : evt))
      );
      setSnackbarMessage(
        `Reminder ${updatedEvent.reminder ? "enabled" : "disabled"}!`
      );
    } catch (error) {
      console.error("Error toggling reminder:", error);
      alert("Failed to update reminder. Please try again.");
    } finally {
      setSnackbarOpen(true); // Show Snackbar after toggling reminder
    }
  };

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Manage Your Events
        </Typography>

        {/* Add Event Button */}
        <Tooltip title="Add Event" arrow>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => handleOpen()}
            sx={{ position: "fixed", bottom: 20, right: 20 }}>
            <Add />
          </Fab>
        </Tooltip>

        {/* Event List */}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Your Events
          </Typography>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}>
              <CircularProgress /> {/* Loader Spinner */}
            </Box>
          ) : events.length === 0 ? (
            <Typography variant="body1">No events available.</Typography>
          ) : (
            <List>
              {events.map((event) => (
                <ListItem key={event.id} button>
                  <ListItemText
                    primary={event.title}
                    secondary={format(new Date(event.date), "PPPP")}
                  />
                  <Box display="flex" alignItems="center">
                    {/* Edit Button */}
                    <Tooltip title="Edit Event">
                      <IconButton edge="end" onClick={() => handleOpen(event)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {/* Delete Button */}
                    <Tooltip title="Delete Event">
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(event.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    {/* Reminder Toggle */}
                    <Tooltip title="Toggle Reminder">
                      <IconButton
                        edge="end"
                        onClick={() => toggleReminder(event)}>
                        {event.reminder ? <AlarmOn /> : <AlarmOff />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Modal for Adding/Editing Events */}
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
