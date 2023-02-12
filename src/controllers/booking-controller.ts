import { Response } from "express";
import { AuthenticatedRequest, handleApplicationErrors } from "@/middlewares";
import bookingService from "@/services/booking-service"
import httpStatus from "http-status";

export async function getBooking (req: AuthenticatedRequest, res: Response) {
    const {userId} = req;
    
    try {
        const userBooking = await bookingService.getBookingByUser(userId);
        return res.status(httpStatus.OK).send(userBooking);
    } catch (error) {
        handleApplicationErrors(error, req, res)
    }
}

export async function postBooking(req: AuthenticatedRequest, res:Response){
    const {userId} = req;
    const {roomId} = req.body;


    try {   
        await bookingService.checkEnrollment(userId)     
        const newBooking = await bookingService.postBookingByUser(userId, Number(roomId));
        return res.status(httpStatus.OK).send({id :newBooking.id});

    } catch (error) {
        handleApplicationErrors(error, req, res);
    }
}
