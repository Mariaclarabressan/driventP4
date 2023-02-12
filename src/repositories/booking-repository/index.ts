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
            userId: userId, roomId:roomId
        }
    });
}

async function findAllBookingsByRoom (roomId: number){
    return prisma.booking.findMany({
        where: {roomId: roomId}
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

async function findManyBookingByUserId( userId: number) { 
    return prisma.booking.findMany({
        where: {
            userId: userId
        }
    })

}

const bookingRepository = {
    findBookingByRoom,
    findBookingByUser,
    postNewBooking,
    createNewBooking,
    findAllBookingsByRoom,
    findManyBookingByUserId
};

export default bookingRepository;