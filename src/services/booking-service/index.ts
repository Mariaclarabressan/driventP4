import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import hotelRepository from "@/repositories/hotel-repository";
import { notFoundError, BookingError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";

async function getBookingByUser(userId: number) {
    const getUserWithBooking = await bookingRepository.findBookingByUser(userId);
    if (!getUserWithBooking) {
        throw notFoundError();
    }

    return getUserWithBooking;
}

async function postBookingByUser(userId: number, roomId: number) {
    const checkEnrollment = async (userId: number) => {
        const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
        if (!enrollment) {
            throw notFoundError();
        }
    
        const checkTicket = await ticketRepository.findTickeWithTypeById(enrollment.id);
    
        if (!checkTicket || checkTicket.status === "RESERVED" || checkTicket.TicketType.isRemote || !checkTicket.TicketType.includesHotel) {
            throw cannotListHotelsError();
        }
    }    
    
    const newBooking = await bookingRepository.postNewBooking(userId, roomId);

    return newBooking;
}

async function putBooking (userId: number, bookingId: number, roomId: number) {
    
    const findUserWithBooking = await bookingRepository.findBookingByUser(userId); 

    const findRoomByUser = await hotelRepository.findRoom(roomId);


    const roomPeople = await bookingRepository.roomCapacity(roomId);


    if(!findUserWithBooking || findUserWithBooking.id !== bookingId) {
        throw BookingError();
    }

    if(!findRoomByUser) {
        throw notFoundError();
    }

    //if(findRoomByUser.capacity => roomPeople.)
}

const BookingService = {
    getBookingByUser,
    postBookingByUser,
    putBooking
}

export default BookingService;



