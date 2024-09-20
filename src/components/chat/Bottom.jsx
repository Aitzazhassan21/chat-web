import React from "react";
import EmojiPicker from "emoji-picker-react";
import { FaPlus, FaMinus } from "react-icons/fa";

const Bottom = ({
  text,  setText,  img, docFile,  handleEmoji,  handleImg,handleDoc,handleSend,  open,setOpen,showMenu,setShowMenu,isCurrentUserBlocked,isReceiverBlocked,
}) => {
  return (
    <div className="bottom">
      <div className="icons">
        {/* Plus/Minus Icon to Toggle Dropdown Menu */}
        <div
          className="upload-icon"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          {showMenu ? <FaMinus /> : <FaPlus />}
        </div>

        {/* Dropdown Menu for Images and Documents */}
        {showMenu && (
          <div className="dropdown-menu">
            {/* Image Upload Option */}
            <label className="menu-item" htmlFor="image-upload">
              <img src="./gallery.png" alt="Add Images" />
              <span>Add Images</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImg}
                style={{ display: "none" }} // Ensure the input is hidden
              />
            </label>

            {/* Document Upload Option */}
            <label className="menu-item" htmlFor="doc-upload">
              <img src="./document.png" alt="Documents" />
              <span>Documents</span>
              <input
                id="doc-upload"
                type="file"
                accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.xls,.xlsx"
                onChange={handleDoc}
                style={{ display: "none" }} // Ensure the input is hidden
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

      {/* Preview of Image or Document */}
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
  );
};

export default Bottom;
