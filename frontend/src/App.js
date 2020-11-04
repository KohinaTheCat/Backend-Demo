import React, { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";

function App() {
  const [users, setUsers] = useState([""]);
  useEffect(() => {
    axios.get("http://localhost:5000/user/").then((res) => setUsers(res.data));
    // get all users
  });

  return (
    <div className="App">
      <header className="App-header">
        {users.map((u) => (
          <p>{u.username}</p>
        ))}
      </header>
    </div>
  );
}

export default App;
