import React from "react";
import { Dialog, DialogActions, DialogTitle, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const VideoPopup = ({ open, onClose, chatUser }) => {
  const navigate = useNavigate();

  const handleJoin = () => {
    onClose();
    navigate(`/room/${chatUser.roomCode}`); // Assuming roomCode is available from chatUser
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Join Room</DialogTitle>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleJoin} variant="contained">
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoPopup;
