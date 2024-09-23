import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "emoji-picker-react"; 
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { MdBlockFlipped } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import Swal from "sweetalert2";
import "animate.css";
import "sweetalert2/src/sweetalert2.scss";
import { FaPlus, FaMinus } from "react-icons/fa";
const randomID = (len = 5) => {
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  return Array.from({ length: len }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};
const Chat = () => {
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [chat, setChat] = useState({ messages: [] });
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const [docFile, setDocFile] = useState({ file: null, url: "" });
  const [calleeId, setCalleeId] = useState("");
  const [showMenuu, setShowMenuu] = useState(false);
  const zeroCloudInstance = useRef(null);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteIcon, setShowDeleteIcon] = useState(null);

  const endRef = useRef(null);


  const handleDelete = async (messageId, deleteForAll = false) => {
    const { chatId, messages, senderId } = useChatStore.getState();
    if (!chatId) return;
  
    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        if (deleteForAll) {
          return {
            ...msg,
            deletedForEveryone: true, 
            text: "This message has been deleted for everyone.", 
          };
        } else {
          if (msg.senderId === senderId || msg.receiverId === senderId) {
            return { ...msg, deletedForMe: true };
          }
        }
      }
      return msg;
    });
  
    const chatRef = doc(db, "chats", chatId);
    try {
      await updateDoc(chatRef, { messages: updatedMessages });
      setChat({ ...chat, messages: updatedMessages });
  
      Swal.fire({
        title: "Success!",
        text: deleteForAll
          ? "Message deleted for everyone!"
          : "Message deleted for you!",
        icon: "success",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      Swal.fire({
        title: "Error",
        text: "Could not delete the message.",
        icon: "error",
      });
    }
  };
  
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChat(res.data() || { messages: [] });
      });
      return () => unSub();
    }
  }, [chatId]);

  useEffect(() => {
    if (user?.id) {
      const userStatusRef = doc(db, "users", user.id);

      const unsubscribe = onSnapshot(userStatusRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setOnlineStatus(data.onlineStatus);
          setLastSeen(data.lastSeen?.toDate());
        }
      });

      return () => unsubscribe();
    }
  }, [user?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      const userStatusRef = doc(db, "users", currentUser.id);

      const setOnline = async () => {
        await setDoc(
          userStatusRef,
          {
            onlineStatus: true,
            lastSeen: new Date(),
          },
          { merge: true }
        );
      };

      const setOffline = async () => {
        await updateDoc(userStatusRef, {
          onlineStatus: false,
          lastSeen: new Date(),
        });
      };

      setOnline();

      window.addEventListener("beforeunload", setOffline);
      window.addEventListener("unload", setOffline);

      return () => {
        window.removeEventListener("beforeunload", setOffline);
        window.removeEventListener("unload", setOffline);
        setOffline();
      };
    }
  }, [currentUser?.id]);

  const getLastSeenText = () => {
    if (!lastSeen) return "Last seen unavailable";

    const currentTime = new Date();
    const diff = currentTime - lastSeen; // Difference in milliseconds

    if (diff < 60000) {
      return "Just now";
    } else {
      return `Last seen ${format(lastSeen)}`;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      deleteOldMessages();
    }, 60000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    const initZego = async () => {
      const userId = currentUser?.id || randomID();
      const userName = "user_" + userId;
      const appID = 1235460859;
      const serverSecret = "a55460a5515857210e7db4c7772381ec";
      const KitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        null,
        userId,
        userName
      );
      zeroCloudInstance.current = ZegoUIKitPrebuilt.create(KitToken);
      zeroCloudInstance.current.addPlugins({ ZIM });
    };

    initZego();
  }, [currentUser?.id]);

  const handleClearChat = async () => {
    try {
      if (selectedMessages.size) {
        // Filter out messages that are selected for deletion
        const updatedMessages = chat.messages.filter(
          (message) => !selectedMessages.has(message.createdAt)
        );
  
        // Update Firestore with the new messages array
        await updateDoc(doc(db, "chats", chatId), {
          messages: updatedMessages,
        });
  
        Swal.fire({
          title: "Success!",
          text: "Selected messages have been deleted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
  
        // Update local state
        setChat((prevChat) => ({
          ...prevChat,
          messages: updatedMessages,
        }));
  
        // Reset selection
        setSelectedMessages(new Set());
        setSelectAll(false);
      } else {
        Swal.fire({
          title: "No messages selected!",
          text: "Please select messages to delete.",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while clearing the messages.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMessages(new Set());
    } else {
      const allMessageIds = new Set(chat.messages.map(msg => msg.createdAt));
      setSelectedMessages(allMessageIds);
    }
    setSelectAll(prev => !prev);
  };
  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(messageId)) {
        newSelected.delete(messageId);
      } else {
        newSelected.add(messageId);
      }
      return newSelected;
    });
  };
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const deleteOldMessages = async () => {
    try {
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnapshot = await getDoc(chatDocRef);

      if (!chatDocSnapshot.exists()) {
        console.error("Chat document does not exist.");
        return;
      }

    
      const chatData = chatDocSnapshot.data();
      const messages = chatData.messages || [];

      const currentTime = new Date();
      const updatedMessages = messages.filter((msg) => {
        const createdAt = msg.createdAt?.toDate
          ? msg.createdAt.toDate()
          : new Date(msg.createdAt);
        const timeDiff = currentTime - createdAt;
        return !(msg.img || msg.doc) || timeDiff < 60000;
      });
      await updateDoc(chatDocRef, { messages: updatedMessages });
      const updatedChatSnapshot = await getDoc(chatDocRef);
      setChat(updatedChatSnapshot.data() || { messages: [] });
    } catch (error) {
      console.error("Error deleting old messages:", error);
    }
  };

  const handleDoc = (e) => {
    if (e.target.files[0]) {
      setDocFile({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file && !docFile.file) return; // Check that there is a message

    let imgUrl = null;
    let docUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      if (docFile.file) {
        docUrl = await upload(docFile.file);
      }

      const messageId = uuidv4();
      const message = {
        id: messageId,
        senderId: currentUser?.id,
        text,
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }),
        ...(docUrl && { doc: docUrl }),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

      setText("");
      setImg({ file: null, url: "" });
      setDocFile({ file: null, url: "" });

      await updateUserChats(message);
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire({
        title: "Error",
        text: "Could not send message.",
        icon: "error",
      });
    }
  };

  const updateUserChats = async (lastMessage) => {
    const userIDs = [currentUser?.id, user?.id];
    for (const id of userIDs) {
      const userChatsRef = doc(db, "userchats", id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chats.findIndex(
          (c) => c.chatId === chatId
        );

        if (chatIndex !== -1) {
          userChatsData.chats[chatIndex] = {
            ...userChatsData.chats[chatIndex],
            lastMessage: lastMessage.text || "Image/Document",
            isSeen: id === currentUser?.id,
            updatedAt: Date.now(),
          };

          await updateDoc(userChatsRef, { chats: userChatsData.chats });
        }
      }
    }
  };

  const handleCall = async (callType) => {
    if (!calleeId) {
      Swal.fire({
        title: "Caller ID is Empty. Please Enter ID!",
        showClass: {
          popup: "animate__animated animate__fadeInUp animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutDown animate__faster",
        },
      });
      return;
    }
    try {
      const calleeDocRef = doc(db, "users", calleeId);
      const calleeDocSnapshot = await getDoc(calleeDocRef);
      if (!calleeDocSnapshot.exists()) {
        Swal.fire({
          title: "User not found!",
          icon: "error",
          showClass: {
            popup: "animate__animated animate__fadeInUp animate__faster",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutDown animate__faster",
          },
        });
        return;
      }
      const calleeData = calleeDocSnapshot.data();
      const calleeUsername = calleeData.username || "Unknown User";
      const response = await zeroCloudInstance.current.sendCallInvitation({
        callees: [{ userID: calleeId, userName: calleeUsername }],
        callType,
        timeout: 60,
      });
      if (response.errorInvitees.length) {
        alert("The user does not exist or is offline.");
      } else {
        console.log("Call invitation sent successfully:", response);
      }
    } catch (err) {
      console.log("Failed to send call invitation:", err);
      alert("Failed to send call. Please try again later.");
    }
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            {onlineStatus ? (
              <small style={{ color: " lightgreen" }}>Online</small>
            ) : (
              <small style={{ color: "skyblue" }}>{getLastSeenText()}</small>
            )}
          </div>
        </div>
        <div className="icons">
          <img
            src="./phone.png"
            alt="Voice Call"
            onClick={() =>
              handleCall(ZegoUIKitPrebuilt.InvitationTypeVoiceCall)
            }
          />
          <img
            src="./video.png"
            alt="Video Call"
            onClick={() =>
              handleCall(ZegoUIKitPrebuilt.InvitationTypeVideoCall)
            }
          />
          <img
            src="./info.png"
            alt="Info"
            style={{ borderRadius: "50%" }}
            onClick={() => setShowInfoMenu((prev) => !prev)}
          />
          {showInfoMenu && (
            <div
              className="info-dropdown"
              style={{
                position: "fixed",
                top: "26%",
                left: "65%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "16px",
                zIndex: 1000,
              }}
            >
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                <li
                  style={{
                    color: "black",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "7px",
                  }}
                  onClick={handleClearChat}
                >
                  <img
                    src="./DeleteSelected.png"
                    alt="Delete Selected "
                    style={{ marginRight: "8px" }}
                  />
                  Clear-Chat
                </li>
                <li
                  style={{
                    color: "black",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={handleSelectAll}
                >
                  <img
                    src="./sellectall.png"
                    alt="Select All Icon"
                    style={{ marginRight: "8px" }}
                  />
                  {selectAll ? "Deselect All" : "Select All"}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="center">
        <div className="info">
          <span>Caller ID: {currentUser?.id}</span>
          <input
            type="text"
            placeholder="Enter User ID"
            value={calleeId}
            onChange={(e) => setCalleeId(e.target.value)}
          />
        </div>

        {chat.messages
          .filter((message) => {
            if (
              message.deletedForMe &&
              (message.senderId === currentUser?.id ||
                message.receiverId === currentUser?.id)
            ) {
              return false;
            }
            return true;
          })
          .map((message, index) => {
            const createdAt = message.createdAt?.toDate
              ? message.createdAt.toDate()
              : new Date(message.createdAt);
          
            return (
              <div
                className={
                  message.senderId === currentUser?.id
                    ? "message own"
                    : "message"
                }
                key={index}
                onMouseEnter={() => setShowDeleteIcon(index)}
                onMouseLeave={() => setShowDeleteIcon(null)}
              >
                <div className="texts">
                  {message.deletedForEveryone ? (
                    <p>
                      <MdBlockFlipped />
                      This Message Deleted For Everyone.
                    </p>
                  ) : (
                    <>
                      {message.img && (
                        <img src={message.img} alt="User uploaded" />
                      )}
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

                      {selectAll && (
                        <div className="topic">
                          <input
                            type="checkbox"
                            checked={selectedMessages.has(message.createdAt)}
                            onChange={() =>
                              handleSelectMessage(message.createdAt)
                            }
                          />
                        </div>
                      )}
                    </>
                  )}

                  {showDropdown === index && (
                    <div
                      className="message-container"
                      style={{ position: "relative" }}
                    >
                      <div
                        className="message-dropdown"
                        style={{
                          position: "fix",
                          bottom: "10px",
                          left: "150px",
                          display: "flex",
                          flexDirection: "column",
                          backgroundColor: "#fff",
                          padding: "5px 12px",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "5px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <FaTimes
                          color="black"
                          className="cross"
                          onClick={() => setShowDropdown(null)} // Close dropdown on click
                          style={{ cursor: "pointer", alignSelf: "flex-end" }}
                        />
                        <button
                          onClick={() => {
                            handleDelete(message.id, false);
                            setShowDropdown(null); // Close dropdown after action
                          }}
                          className="delete-option"
                          style={{
                            padding: "8px 30px",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: "#e0e0e0",
                            textAlign: "center",
                            marginBottom: "5px",
                            color: "black",
                            fontWeight: "bold",
                            transition: "background-color 0.3s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#f5f5f5")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#e0e0e0")
                          }
                        >
                          Delete for Me
                        </button>

                        <button
                          onClick={() => {
                            handleDelete(message.id, true);
                            setShowDropdown(null);
                          }}
                          className="delete-option"
                          style={{
                            padding: "8px 38px",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: "#e0e0e0",
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "black",
                            transition: "background-color 0.3s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#f5f5f5")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#e0e0e0")
                          }
                        >
                          Everyone
                        </button>
                      </div>
                    </div>
                  )}

                  {showDeleteIcon === index && (
                    <img
                      onClick={() => setShowDropdown(index)}
                      src="./messagedel.png"
                      className="msg-del"
                      style={{
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        position: "absolute",
                        bottom: "6px",
                        right: "-2px",
                        borderRadius: "50%",
                      }}
                      alt="Delete"
                    />
                  )}
                </div>
              </div>
            );
          })}
        <div ref={endRef} />
      </div>
      <div className="bottom">
        <div className="icons">
          <div
            className="upload-icon"
            onClick={() => setShowMenuu((prev) => !prev)}
          >
            {showMenuu ? <FaMinus /> : <FaPlus />}{" "}
          </div>
          {showMenuu && (
            <div className="dropdown-menuuu">
              <label className="menu-item" htmlFor="image-upload">
                <img src="./gallery.png" alt="Add Images" />
                <span>Add Images</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImg}
                  style={{ display: "none" }}
                />
              </label>
              <label className="menu-item" htmlFor="doc-upload">
                <img src="./document.png" alt="Documents" />
                <span>Documents</span>
                <input
                  id="doc-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleDoc}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}
          <div className="emoji">
            <img
              src="./emoji.png"
              alt=""
              onClick={() => setOpen((prev) => !prev)}
            />
            {open && (
              <div className="picker">
                <EmojiPicker onEmojiClick={handleEmoji} />
              </div>
            )}
          </div>
        </div>
        {img.url && (
          <div className="preview-container">
            <img src={img.url} alt="Preview" className="preview-image" />
          </div>
        )}
        {docFile.file && (
          <div className="preview-container">
            <span className="preview-doc">{docFile.file.name}</span>
          </div>
        )}
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};
export default Chat;
