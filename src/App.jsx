function App() {
  return (
    <div style={{
      height: "100vh",
      background: "#000",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1 style={{ fontSize: "48px" }}>📸 Photobox</h1>

      <button style={{
        marginTop: "30px",
        padding: "20px 40px",
        fontSize: "24px",
        cursor: "pointer",
        borderRadius: "10px"
      }}>
        Mulai Foto
      </button>
    </div>
  );
}

export default App;