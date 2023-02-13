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

// TODO tests:
  // userId with any booking --> status 404 (NotFound)ok
  // invalid roomId --> status 404 (NotFound) 
  // room full / without space --> status 403 (Forbidden)
  // roomId dont belong to userId --> status 401 (Unauthorized)
  // update created --> status 200 (OK) + body: { id: updatedBooking.id }


async function putBooking (userId: number, bookingId: number, roomId: number) {
    
    const findUserWithBooking = await bookingRepository.findBookingByUser(userId); 
    
    console.log(findUserWithBooking);
    if(!findUserWithBooking) {
        throw notFoundError()
    }

    if( findUserWithBooking.id !== bookingId) {
        throw ForbidenError();
    }    

    const findRoomByUser = await hotelRepository.findRoom(roomId);

    if(!findRoomByUser) {
        throw notFoundError();
    }
    
    const roomPeople = await bookingRepository.findAllBookingsByRoom(roomId);
    
    if(roomPeople.length <= findRoomByUser.capacity){
        throw ForbidenError();
    }

    return await bookingRepository.updateBooking(bookingId, roomId);

    
}

const BookingService = {
    getBookingByUser,
    postBookingByUser,
    putBooking,
    checkEnrollment
}

export default BookingService;



