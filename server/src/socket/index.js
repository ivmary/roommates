const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Apartment = require("../models/Apartment");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Not authorized"));

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select("-password");
    if (!user) return next(new Error("Not authorized"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Token invalid or expired"));
  }
};

async function resolveConversation(
  io,
  socket,
  { conversationId, apartmentId },
) {
  if (conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: socket.user._id,
    });
    return conversation
      ? { conversation }
      : { error: "Conversation not found" };
  }

  const apartment = await Apartment.findById(apartmentId);
  if (!apartment) return { error: "Listing not found" };
  if (apartment.owner.toString() === socket.user._id.toString()) {
    return { error: "Cannot start a conversation with yourself" };
  }

  let conversation = await Conversation.findOne({
    apartment: apartmentId,
    participants: { $all: [apartment.owner, socket.user._id] },
  });

  if (conversation) {
    socket.join(conversation._id.toString());
    return { conversation };
  }

  conversation = await Conversation.create({
    apartment: apartmentId,
    participants: [apartment.owner, socket.user._id],
  });
  socket.join(conversation._id.toString());
  io.in(apartment.owner.toString()).socketsJoin(conversation._id.toString());

  await conversation.populate("apartment", "title images");
  await conversation.populate("participants", "name avatar");
  io.to(apartment.owner.toString()).emit("conversation:new", conversation);

  return { conversation };
}

function initSocket(io) {
  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    socket.join(socket.user._id.toString());

    const myConversations = await Conversation.find({
      participants: socket.user._id,
    }).select("_id");
    myConversations.forEach((c) => socket.join(c._id.toString()));

    socket.on("join:conversation", async (conversationId) => {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id,
      });
      if (!conversation) return;

      socket.join(conversationId);
    });

    socket.on(
      "message:send",
      async ({ conversationId, apartmentId, text }, callback) => {
        const ack = typeof callback === "function" ? callback : () => {};
        if (!text?.trim() || (!conversationId && !apartmentId)) {
          return ack({ error: "Invalid message" });
        }

        const { conversation, error } = await resolveConversation(io, socket, {
          conversationId,
          apartmentId,
        });
        if (!conversation) return ack({ error });

        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          text: text.trim(),
        });
        await message.populate("sender", "name avatar");

        io.to(conversation._id.toString()).emit("message:new", message);
        ack({ conversationId: conversation._id.toString() });
      },
    );
  });
}

module.exports = initSocket;
