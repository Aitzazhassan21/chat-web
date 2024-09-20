// src/components/CallInvitation.jsx
import React from "react";
import "./CallInvitation.css"; // You can style this component

const CallInvitation = ({ callerName, onAccept, onDecline }) => {
  return (
    <div className="call-invitation">
      <p>{callerName} is calling you!</p>
      <button onClick={onAccept}>Accept</button>
      <button onClick={onDecline}>Decline</button>
    </div>
  );
};

export default CallInvitation;
