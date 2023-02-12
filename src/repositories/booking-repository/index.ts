import {prisma} from "@/config";

async function findBookingByUser(userId: number){
    return prisma.booking.findFirst({
        where: {userId},
        include: {
            Room: true,
        }
    });
}

async function findBookingByRoom (roomId: number) {
    return prisma.booking.findMany({
        where: {roomId}
    });
}

async function postNewBooking (userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId, roomId
        }
    });
}

async function roomCapacity (userId: number){
    return prisma.booking.findFirst({
        where: {userId}
    })
}

async function createNewBooking (bookingId: number, roomId: number){
    return prisma.booking.update({
        where: {
            id: bookingId
        },
        data : {
            roomId
        }
    });
}

const bookingRepository = {
    findBookingByRoom,
    findBookingByUser,
    postNewBooking,
    createNewBooking,
    roomCapacity
};

export default bookingRepository;