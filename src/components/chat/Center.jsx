import React, { useRef, useEffect } from "react";
import { format } from "timeago.js";

const Center = ({ chat, currentUser }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  return (
    <div className="center">
      {chat.messages.map((message, index) => {
        const createdAt = message.createdAt?.toDate
          ? message.createdAt.toDate()
          : new Date(message.createdAt);

        return (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={index}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="User uploaded" />}
              {message.doc && (
                <p>
                  <a
                    href={message.doc}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download File
                  </a>
                </p>
              )}
              {message.text && <p>{message.text}</p>}
              <span className="timestamp">{format(createdAt)}</span>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

export default Center;






  {/* <div className="center">
  <div className="info">
    <span>Caller ID: {currentUser?.id}</span>
    <input
      type="text"
      placeholder="Enter User ID"
      value={calleeId}
      onChange={(e) => setCalleeId(e.target.value)}
    />
  </div> 
  {chat.messages.map((message, index) => {
    const createdAt = message.createdAt?.toDate
      ? message.createdAt.toDate()
      : new Date(message.createdAt);

    return (
      <div
        className={
          message.senderId === currentUser?.id ? "message own" : "message"
        }
        key={index}
        onMouseEnter={() => setShowDropdown(index)}
      >
        <div className="texts">
          {message.img && <img src={message.img} alt="User uploaded" />}
          {message.doc && (
            <p>
              <a
                href={message.doc}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download File
              </a>
            </p>
          )}
                  {selectAll && (
                  <div className="topic">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.createdAt)}
                      onChange={() => handleSelectMessage(message.createdAt)}
                    />
                  </div>
                )}
          {message.text && <p>{message.text}</p>}
          <span className="timestamp">{format(createdAt)}</span>
      
        
          {showDropdown === index && (
            <div
              className="message-container"
              style={{ position: "relative" }}
            >
              <div
                className="message-dropdown"
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "0px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0",
                  borderRadius: "50%",
                }}
              >
                <img
                  onClick={() => handleDelete(message)}
                  src="./messagedel.png"
                  className="msg-del"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          )}
          
        </div>
      </div>
    );
  })}
  <div ref={endRef} />
</div> */}