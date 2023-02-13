import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import e from "express";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createBooking,
  createTicketTypeWithoutHotel
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {

    it("should respond with status 404 when user has no booking ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      // const enrollment = await createEnrollmentWithAddress(user);
      // const ticketType = await createTicketTypeRemote();
      // const ticket = await createTicketTypeWithHotel();
      // const hotel = await createHotel();
      // const room = await createRoomWithHotelId(hotel.id);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);


    });

    it("should respond with status 200 and the booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const room = await createRoomWithHotelId(createdHotel.id)
      const booking = await createBooking(user.id, room.id)
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);

      const expectedBookingObject = {
        id: booking.id,
        userId: booking.userId,
        roomId: booking.roomId,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      };

      expect(response.body).toMatchObject(
        expectedBookingObject
      );
    });


  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    //erros categoria 404

    it("should respond with status 404 when room does not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();

      const response = await server.post("/booking").send({ roomId: 0 }).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when enrollment is incorrect", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking").send({ roomId: 0 }).set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when the ticket was not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket was not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      
    });

    it("should respond with status 403 when the ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when the ticket was not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user choice a full room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const room = await createRoomWithHotelId(createdHotel.id)
      const booking = await createBooking(user.id, room.id)
      const response = await server.post("/booking").send({roomId : room.id}).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);

    })

    it("should respond with status 200 and the booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const room = await createRoomWithHotelId(createdHotel.id)

      const response = await server.post("/booking").send({roomId : room.id}).set("Authorization", `Bearer ${token}`);


      expect(response.status).toBe(httpStatus.OK);

      const newBookingObject = {
        id: expect.any(Number)
      }
      expect(response.body).toMatchObject(newBookingObject)

    });


  });
});

function testBodyF() {
  return {
    "roomId": 3
  };
}

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const testBody = testBodyF();
    const response = await server.put("/booking/7").send(testBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const testBody = testBodyF();
    const response = await server.put("/booking/4").set("Authorization", `Bearer ${token}`).send(testBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const testBody = testBodyF();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(testBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when booking does not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when the user tries to change a booking that is not his " ,async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const room = await createRoomWithHotelId(createdHotel.id)
      const booking = await createBooking(user.id, room.id)
      const response = await server.put("/booking/1").send({bookingId: booking.id}).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      
    })

  });
});
