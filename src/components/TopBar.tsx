"use client";

export default function TopBar() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">AI-native auto insurance</p>
        <h1>Your driving history did not start when you landed in the U.S.</h1>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications">
          <span aria-hidden="true">!</span>
        </button>
        <button className="profile-button" type="button">
          <span className="profile-avatar" aria-hidden="true">SP</span>
          <span>Sumanth</span>
        </button>
      </div>
    </header>
  );
}
