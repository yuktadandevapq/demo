const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  const userId = socket.handshake.query.userId as string;

  if (userId && userId !== "undefined") {
    if (userSocketMap[userId]) {
      delete userSocketMap[userId];
    }
    userSocketMap[userId] = socket.id;
    socket.data.userId = userId; 
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("join", (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined room`);
  });
  socket.on('joinGroup', async ({ groupId, userId }) => {
    try {
      const group = await GroupModel.findOne({
        _id: groupId,
        $or: [{ members: { $in: [userId] } }, { admin: userId }]
      });
  
      if (group) {
        socket.join(groupId);
        console.log(`User ${userId} joined group ${groupId}`);
      } else {
        socket.emit('error', 'You are not a member of this group');
      }
    } catch (error) {
      logger.error(`Error joining group: ${error}`);
      socket.emit('error', 'An error occurred while joining the group');
    }
  });
  socket.on("groupmessage", (data) => handleSendMessage(io, socket, data)); 
  socket.on("leave", (userId) => {
    socket.leave(userId);
    logger.info(`User left room ${userId}`);
  });


  socket.on("disconnect", () => {
    const userId = socket.data.userId; 
    if (userId) {
      logger.info("User disconnected:", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

httpServer.listen(PORT, () => {
    const URL = process.env.MOGO_URL || '';
    if (!URL) {
      logger.error('Database URL is not defined');
    }
    Connect(URL);
    logger.info(`Server is running on port ${PORT}`);
  });
  
export { app, io, httpServer };



export const handleSendMessage = async (
    io: Server,
    socket: Socket,
    { groupId, senderId, message, file }: { groupId:string, senderId:string, message:string, file:string }
  ) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const group = await Group.findOne({
                  _id: groupId,
                  $or: [{ members: { $in: [senderId] } }, { admin:senderId }]
                }).session(session);
      if (!group) {
           await session.abortTransaction();
           session.endSession();
          return socket.emit('error', 'Group not found');
      }
      const newMessage = new Group_Messages({
          groupId,
          senderId,
          message,
          file
      });
  
      await newMessage.save({session});
      await session.commitTransaction();
       session.endSession();
      io.to(groupId).emit('newMessage', { groupId, senderId, message, file });
  } catch (error) {
    await session.abortTransaction()
    session.endSession();
    logger.error('error:',error)
      socket.emit('error', 'Internal Server Error');
  }
  };

 export const getMessages=async(req:Node_Type,res:Response,next:NextFunction):Promise_Type=>{
   try{
    const group = await Group.findOne({
        _id: req.params.id,
        $or: [{ members: { $in: [req.user.id] } }, { admin:req.user.id }]
      })
    if(!group){
        return res.status(200).json({message:'Access denied'})
    }
    const messages=await Group_Messages.aggregate([
        {$match:{groupId:new mongoose.Types.ObjectId(req.params.id)}},
        {$lookup:{from:"auths",localField:"senderId",foreignField:"_id",as:"sender"}}, 
        {$project:{
            _id:1,
            "sender.firstname": 1,
            "sender.lastname": 1,
            "sender.image": {$ifNull:['$sender.image',null]},
            message:1,
            file:{$ifNull:['$file',null]},
            createdAt:1
        }}
    ])
    return res.status(200).json({status:true,messages})
   }
   catch(err){
    next(err)
   }
  }
