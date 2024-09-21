"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Modal,
  TextField,
  IconButton,
  Checkbox,
  List,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Fab,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Snackbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add, DarkMode, LightMode, Delete } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useRouter } from "next/navigation";

const localizer = momentLocalizer(moment);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message for the Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Control the Snackbar visibility
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    reminder: false,
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateEventsOpen, setDateEventsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const router = useRouter();

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#90caf9" : "#3f51b5",
      },
      secondary: {
        main: "#f48fb1",
      },
      background: {
        default: darkMode ? "#121212" : "#ffffff",
      },
    },
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/events", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setEvents(
          response.data.map((event) => ({
            ...event,
            start: new Date(event.date),
            end: new Date(event.date),
          }))
        );
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized: Please sign in.");
        } else {
          console.error("Error fetching events:", error);
        }
      } finally {
        setLoading(false); // Stop the loading spinner once data is fetched
      }
    };

    if (session) {
      fetchEvents();
    }
  }, [session]);

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
      let response;
      if (currentEvent.id) {
        response = await axios.put(
          `/api/events/${currentEvent.id}`,
          currentEvent,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        setEvents((prev) =>
          prev.map((evt) => (evt.id === currentEvent.id ? response.data : evt))
        );
        setSnackbarMessage("Event updated successfully!"); // Snackbar message for update
      } else {
        response = await axios.post("/api/events", currentEvent, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setEvents((prev) => [...prev, response.data]);
        setSnackbarMessage("Event added successfully!"); // Snackbar message for add
      }
      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    } finally {
      setSnackbarOpen(true); // Show Snackbar after saving
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/events/${id}`, {
        data: { id },
      });
      if (response.status === 200) {
        setEvents((prev) => prev.filter((event) => event.id !== id));
        setSnackbarMessage("Event deleted successfully!"); // Snackbar message for delete
      } else {
        console.error("Failed to delete event:", response.statusText);
        alert("Failed to delete event. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setSnackbarOpen(true); // Show Snackbar after deleting
    }
  };

  const handleSelectEvent = (event) => {
    setCurrentEvent(event);
    handleOpen(event);
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setDateEventsOpen(true);
  };

  const eventsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(
      (event) =>
        moment(event.start).format("YYYY-MM-DD") ===
        moment(selectedDate).format("YYYY-MM-DD")
    );
  }, [selectedDate, events]);

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: "5px",
        opacity: 0.9,
        color: "white",
        padding: "3px",
        border: "0px",
        display: "block",
      },
    };
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen">
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Event Horizon
            </Typography>
            {session ? (
              <>
                <Button
                  color="inherit"
                  sx={{ mr: 2 }}
                  onClick={() => router.push("/manageEvents")}>
                  Manage Events
                </Button>
                <Avatar
                  alt={session.user.name}
                  src={session.user.image}
                  sx={{ width: 48, height: 48, mr: 2 }}
                />
                <Typography
                  variant="body1"
                  className="sm:block hidden"
                  sx={{ mr: 2 }}>
                  {session.user.name}
                </Typography>
                <Button color="inherit" onClick={() => signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={() => signIn("github")}>
                Sign in with GitHub
              </Button>
            )}
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Box mt={4}>
            <Typography variant="h4" gutterBottom>
              Welcome, {session?.user?.name || "to Calendar App"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              You are signed in as {session?.user?.email}.
            </Typography>
            {session && (
              <Box mt={4}>
                <Paper elevation={3}>
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 600,
                      }}>
                      <CircularProgress /> {/* Loader spinner */}
                    </Box>
                  ) : (
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 600 }}
                      onSelectEvent={handleSelectEvent}
                      onSelectSlot={handleSelectSlot}
                      selectable
                      eventPropGetter={eventStyleGetter}
                    />
                  )}
                </Paper>
              </Box>
            )}
          </Box>
        </Container>

        {/* Floating Action Button for Adding Events */}
        {session && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => handleOpen()}
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              width: 65,
              height: 65,
            }}>
            <Add sx={{ fontSize: 30 }} />
          </Fab>
        )}

        {/* Event Creation/Edit Modal */}
        <Modal open={open} onClose={handleClose}>
          <Paper
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 450,
              p: 4,
              borderRadius: "10px",
            }}>
            <Typography variant="h6" component="h2">
              {currentEvent.id ? "Edit Event" : "Add Event"}
            </Typography>
            <TextField
              label="Title"
              value={currentEvent.title}
              onChange={(e) =>
                setCurrentEvent({ ...currentEvent, title: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              value={currentEvent.description}
              onChange={(e) =>
                setCurrentEvent({
                  ...currentEvent,
                  description: e.target.value,
                })
              }
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
            <DatePicker
              selected={currentEvent.date}
              onChange={(date) =>
                setCurrentEvent({ ...currentEvent, date: date })
              }
              showTimeSelect
              dateFormat="Pp"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentEvent.reminder}
                  onChange={(e) =>
                    setCurrentEvent({
                      ...currentEvent,
                      reminder: e.target.checked,
                    })
                  }
                />
              }
              label="Set Reminder"
            />
            <Box mt={2} textAlign="right">
              <Button onClick={handleClose} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </Paper>
        </Modal>

        {/* Date-specific events modal */}
        <Modal
          open={dateEventsOpen}
          onClose={() => setDateEventsOpen(false)}
          aria-labelledby="date-events-modal">
          <Paper
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 450,
              p: 4,
              borderRadius: "10px",
            }}>
            <Typography variant="h6">
              Events on {moment(selectedDate).format("MMMM Do, YYYY")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {eventsForDate.map((event) => (
                <Card key={event.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{event.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {event.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(event.id)}>
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </List>
            <Box mt={2} textAlign="right">
              <Button onClick={() => setDateEventsOpen(false)}>Close</Button>
            </Box>
          </Paper>
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
      </div>
    </ThemeProvider>
  );
}
