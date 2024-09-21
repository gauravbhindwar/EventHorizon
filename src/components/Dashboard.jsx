"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    reminder: false,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/events", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setEvents(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized: Please sign in.");
        } else {
          console.error("Error fetching events:", error);
        }
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
      if (currentEvent.id) {
        // Update existing event
        const response = await axios.put(
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
      } else {
        // Create new event
        const response = await axios.post("/api/events", currentEvent, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setEvents((prev) => [...prev, response.data]);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Calendar App
          </Typography>
          {session ? (
            <>
              <IconButton color="inherit" onClick={() => handleOpen()}>
                ADD EVENT
                <Add />
              </IconButton>
              <div className="relative h-10 w-10">
                <Image
                  className="rounded-full"
                  src={session.user.image}
                  alt={session.user.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <Typography variant="body1" className="ml-4">
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
        </Toolbar>
      </AppBar>
      <Container>
        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Welcome, {session?.user?.name || "to Calendar App"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            You are signed in as {session?.user?.email}.
          </Typography>
          {session && (
            <>
              <Box mt={4}>
                <Card
                  onClick={() => router.push("/manageEvents")}
                  sx={{ cursor: "pointer" }}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Manage Events
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click here to manage your events.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Your Events
                </Typography>
                <List>
                  {events.map((event) => (
                    <ListItem
                      key={event.id}
                      button
                      onClick={() => handleOpen(event)}>
                      <ListItemText
                        primary={event.title}
                        secondary={new Date(event.date).toDateString()}
                      />
                      <Box display="flex" alignItems="center">
                        <IconButton
                          edge="end"
                          onClick={() => handleOpen(event)}>
                          <Edit />
                        </IconButton>
                        <Checkbox
                          edge="end"
                          checked={event.reminder}
                          onChange={() =>
                            setEvents((prev) =>
                              prev.map((evt) =>
                                evt.id === event.id
                                  ? { ...evt, reminder: !evt.reminder }
                                  : evt
                              )
                            )
                          }
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(event.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </Box>
      </Container>
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
    </div>
  );
}
