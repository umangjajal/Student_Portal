export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    socket.on("join", (room) => {
      socket.join(room);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};
