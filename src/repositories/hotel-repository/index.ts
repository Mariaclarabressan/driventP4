import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    }
  });
}

async function findRoom(roomId: number) {
  return prisma.room.findFirst({
    where: { id: roomId }, 
  });  
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findRoom
};

export default hotelRepository;
