import React from "react";
import { format } from "timeago.js";

const Top = ({
  user,
  onlineStatus,
  getLastSeenText,
  handleCall,
  calleeId,
  setCalleeId,
  currentUser,
}) => {
  return (
    <div className="top">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <div className="texts">
          <span>{user?.username}</span>
          {onlineStatus ? (
            <small style={{ color: "lightgreen" }}>Online</small>
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
        <img src="./info.png" alt="Info" />
      </div>
      <div className="info">
        <span>Caller ID: {currentUser?.id}</span>
        <input
          type="text"
          placeholder="Enter User ID"
          value={calleeId}
          onChange={(e) => setCalleeId(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Top;










 // const handleSend = async () => {
  //   if (text === "" && !img.file && !docFile.file) return;

  //   let imgUrl = null;
  //   let docUrl = null;

  //   try {
  //     if (img.file) {
  //       imgUrl = await upload(img.file);
  //     }

  //     if (docFile.file) {
  //       docUrl = await upload(docFile.file);
  //     }

  //     console.log("Sending message with data:", {
  //       senderId: currentUser.id,
  //       text,
  //       createdAt: new Date(),
  //       ...(imgUrl && { img: imgUrl }),
  //       ...(docUrl && { doc: docUrl }),
  //     });

  //     await updateDoc(doc(db, "chats", chatId), {
  //       messages: arrayUnion({
  //         senderId: currentUser.id,
  //         text,
  //         createdAt: new Date(),
  //         ...(imgUrl && { img: imgUrl }),
  //         ...(docUrl && { doc: docUrl }),
  //       }),
  //     });
  //     Swal.fire({
  //       title: "Success!",
  //       text: "Sending successfully!",
  //       icon: "success",
  //     });
  //     const userIDs = [currentUser.id, user.id];
  //     userIDs.forEach(async (id) => {
  //       const userChatsRef = doc(db, "userchats", id);
  //       const userChatsSnapshot = await getDoc(userChatsRef);

  //       if (userChatsSnapshot.exists()) {
  //         const userChatsData = userChatsSnapshot.data();
  //         const chatIndex = userChatsData.chats.findIndex(
  //           (c) => c.chatId === chatId
  //         );

  //         userChatsData.chats[chatIndex] = {
  //           ...userChatsData.chats[chatIndex],
  //           lastMessage: text,
  //           isSeen: id === currentUser.id,
  //           updatedAt: Date.now(),
  //         };

  //         await updateDoc(userChatsRef, { chats: userChatsData.chats });
  //       }
  //     });
  //   }catch (err) {
  //     console.error("Error sending message:", err.message); // Logs the error message
  //     console.error("Error details:", err.stack); // Logs the stack trace
  //   }
  //   finally {
  //     setImg({ file: null, url: "" });
  //     setDocFile({ file: null, url: "" });
  //     setText("");
  //     console.log(`Sender ID: ${senderId}`);
  //     console.log(`Receiver ID: ${receiverId}`);
  //     console.log(`Message: ${message}`);
  //   }
  // };

  
  // const handleDelete = async (message) => {
  //     try {
  //         const updatedMessages = chat.messages.filter(
  //             (msg) => msg.createdAt !== message.createdAt
  //           );
        
  //           await updateDoc(doc(db, "chats", chatId), { messages: updatedMessages });
  //           setChat({ messages: updatedMessages });
  //         } catch (error) {
  //             console.error("Error deleting message:", error);
  //           }
  //         };
  // Function to handle message deletion for 'Delete for Me' or 'Delete for Everyone'