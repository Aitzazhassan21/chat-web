import { arrayRemove, arrayUnion, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    useChatStore();
  const { currentUser } = useUserStore();
  const [sentItems, setSentItems] = useState([]);

  useEffect(() => {
    if (currentUser?.id && chatId) {
      const unsubscribe = onSnapshot(doc(db, "chats", chatId), (doc) => {
        if (doc.exists()) {
          setSentItems(
            doc.data().messages.filter((item) => item.img || item.doc)
          );
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser?.id, chatId]);

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  const handleDownload = (url, filename) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || ""; // Use the filename if provided
      document.body.appendChild(link); // Append link to body
      link.click(); // Trigger the download
      document.body.removeChild(link); // Remove link from the document
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  
  

  return (
    <div className="detail">
      <div className="users">
        <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{user?.username}</h2>
        <p>{user?.email || "No email provided"}</p>
      </div>

      <div className="info">
        <div className="options">
          <div className="titles">
            <span>Sent Items</span>
            <img src="./arrowDown.png" alt="Dropdown Arrow" />
          </div>
          <div className="photos">
          {sentItems.map((item, index) => (
  <div className="photoItem" key={index}>
    <div className="photoDetail">
      {item.img && (
        <>
          <img src={item.img} alt={`Sent Image ${index}`} />
          <span>{`Image_${index + 1}`}</span>
          <img
            src="./download.png"
            alt="Download"
            className="icon"
            style={{ marginLeft: "54px" }}
            onClick={() => handleDownload(item.img, `Image_${index + 1}.jpg`)}
          />
        </>
      )}
      {item.doc && (
        <>
        <img src="./document.png" alt="document" />
        <span>{`Document_${index + 1}`}</span>
        <img
  src="./download.png"
  alt="Download"
  className="icon"
  style={{ marginLeft: "27px" }}
  onClick={() => handleDownload(item.img, `Image_${index + 1}.jpg`)}
/>

        </>
      )}
    </div>
  </div>
))}

          </div>
        </div>

        <button className="block" onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
