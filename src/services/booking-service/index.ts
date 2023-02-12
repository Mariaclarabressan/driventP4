import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

import hotelRepository from "@/repositories/hotel-repository";
import { notFoundError, ForbidenError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { FORBIDDEN } from "http-status";
import { forbidden } from "joi";

async function getBookingByUser(userId: number) {
    const getUserWithBooking = await bookingRepository.findBookingByUser(userId);
    if (!getUserWithBooking) {
        throw notFoundError();
    }

    return getUserWithBooking;
}

const checkEnrollment = async (userId: number) => {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

    if (!enrollment) {
        throw notFoundError();
    }

    const checkTicket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!checkTicket || checkTicket.status === "RESERVED" || checkTicket.TicketType.isRemote || !checkTicket.TicketType.includesHotel) {
        throw cannotListHotelsError();
    }
} 

/*
sem enrollment ---> 404; ok
se o ticket não é encontrado ---> 403 forbiden ok 
se o ticket não foi pago ----> 403 ok
se o ticket é remoto ---> 403 ok
se não inclue hotel ---> 403 OK
*****
se o roomId não for válido ---> 404 ok

se o room tá lotado ---> 403 ok

se deu tudo certo ---> 200 + objeto {
    id: bookingId
}
*/

async function postBookingByUser(userId: number, roomId: number) {
     
    const checkRoomID = await hotelRepository.findRoom(roomId)

    if(!checkRoomID) {
        throw notFoundError();
    }

    
    const bookingsRoom = await bookingRepository.findAllBookingsByRoom(roomId)

    

    if(bookingsRoom.length == checkRoomID.capacity ) {
        throw ForbidenError();
    }

    const newBooking = await bookingRepository.postNewBooking(userId, roomId);


    return newBooking;
}

async function putBooking (userId: number, bookingId: number, roomId: number) {
    
    const findUserWithBooking = await bookingRepository.findBookingByUser(userId); 

    const findRoomByUser = await hotelRepository.findRoom(roomId);


    const roomPeople = await bookingRepository.findAllBookingsByRoom(roomId);


    if(!findUserWithBooking || findUserWithBooking.id !== bookingId) {
        throw ForbidenError();
    }

    if(!findRoomByUser) {
        throw notFoundError();
    }

    //if(findRoomByUser.capacity => roomPeople.)
}

const BookingService = {
    getBookingByUser,
    postBookingByUser,
    putBooking,
    checkEnrollment
}

export default BookingService;



