import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service"
import httpStatus from "http-status";

export async function getBooking (req: AuthenticatedRequest, res: Response) {
    const {userId} = req;
    
    try {
        const userBooking = await bookingService.getBookingByUser(userId);
        return res.status(httpStatus.OK).send(userBooking);
    } catch (error) {
        if(error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.BAD_REQUEST);        
    }
}

export async function postBooking(req: AuthenticatedRequest, res:Response){
    const {userId} = req;
    const roomId = req.body.roomId;

    try {        
        const newBooking = await bookingService.postBookingByUser(userId, roomId);
        return res.status(httpStatus.OK).json({id : newBooking});

    } catch (error) {
        if(error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.BAD_REQUEST)
        }
    }
}
