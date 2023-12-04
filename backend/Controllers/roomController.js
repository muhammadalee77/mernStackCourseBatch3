import Room from "../Models/roomModel.js";
import Hotel from "../Models/hotelModel.js";
import { createError } from "../Utils/Error.js";
import {updateHotel} from "./hotelController.js"

export const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  const newRoom = new Room(req.body);

  try {
    const savedRoom = await newRoom.save();
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};


export const updateRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const updatedRoomData = req.body;

    // Update the room in the Room collection
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $set: updatedRoomData },
      { new: true }
    );

    if (!updatedRoom) {
      // If the room doesn't exist, return an error
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get the hotel ID associated with the room
    const hotelId = updatedRoom.hotelId; // Assuming there is a hotelId field in the Room model

    // Trigger update in the HotelController
    await updateHotel(roomId, updatedRoomData);

    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};
export const updateRoomAvailability = async (req, res, next) => {
  try {
    await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $push: {
          "roomNumbers.$.unavailableDates": req.body.dates,
        },
      }
    );
    res.status(200).json("Room status has been updated.");
  } catch (err) {
    next(err);
  }
};
export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};
