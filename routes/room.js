const express = require("express");

const router = express.Router();

// rooms array to store room details
const rooms = [];

// route for home page
router.get("/",(req,res)=>{
    res.status(200).send('<p>Hall booking App is online.Please refer api documentation for route info.</p>');
})

// route to create a room
router.post("/createRoom", (req,res)=>{
    const {room_name, no_of_seats, amenities, price_per_hour} = req.body;
    try {
        const new_room = {
            room_name,
            no_of_seats,
            amenities,
            price_per_hour,
            room_id: `${room_name}-${rooms.length+1}`,
            booking_details:[]
        };
        rooms.push(new_room);
        res.status(201).send(`Room created with Id:${new_room.room_id}`); 
    } catch (error) {
        res.status(500).send(`Resource cannot be created`);        
    }    
});

// route to list all rooms available
router.get("/listAllRooms",(req, res)=>{
    {rooms.length>0?res.status(200).send(rooms):res.status(200).send("Rooms not yet created")};
});

// route to book a room
router.post("/bookRoom",(req,res)=>{
    let {customer_name, start_time, end_time, room_id} = req.body;
    let date = new Date(req.body.date);
    let data = {customer_name, date, start_time, end_time, status:"Booked", booking_id:`${customer_name}-${room_id}`, booking_date: new Date().toISOString().split("T")[0]}; 
    try {
        if(!rooms) {
            return res.status(500).send("Booking not opened yet");
        }
        const roomIdExists = rooms.findIndex((ele)=>ele.room_id === room_id);
        if(roomIdExists === -1){
            return res.status(400).send("Invalid Room ID");
        }
        const matchingRoom = rooms[roomIdExists]["booking_details"];
        let confirm = undefined;
        if(matchingRoom.length === 0) {
            confirm = true;
            matchingRoom.push(data);
        } else {        
            matchingRoom.forEach(booking =>{
                if(booking.date.getTime()=== date.getTime() && booking.start_time === start_time){
                    confirm = false;
                } else {
                    confirm = true;
                    matchingRoom.push(data);
                }
            });
        }
        if(confirm) {
            return res.status(201).send("Booking Confirmed");
        } else {
            return res.status(400).send("Requested Date and Slot not available");
        }

    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// route to list details of booked customers
router.get("/listBookedCustomers",(req,res)=>{
    try {
      let bookedCustomers = [];
      rooms.forEach((room)=>{
        room.booking_details.forEach((booking)=>{
            let customer = {
                room_name:room.room_name,
                customer_name:booking.customer_name,
                date:booking.date,
                start_time: booking.start_time,
                end_time: booking.end_time,
            };
            bookedCustomers.push(customer);
        })
      })
      res.status(200).send(bookedCustomers);  
    } catch (error) {
        res.status(500).send("Server Error")
    }
});

// booking list for each customer
router.get("/customerBookingList",(req,res)=>{
    try {
        let customers = [];
        rooms.forEach((room)=>{
            room.booking_details.forEach((booking)=>{
                const customerExists = customers.findIndex((customer)=>customer.name === booking.customer_name);              
                if(customerExists === -1) {
                   
                    let customer = {name:booking.customer_name, booking:[]};
                    let customerBooking = {
                        room_name:room.room_name,
                        date: booking.date,
                        start_time: booking.start_time,
                        end_time: booking.end_time,
                        booking_id: booking.booking_id,
                        booking_date:booking.booking_date,
                        status: booking.status
                    };
                    customer.booking.push(customerBooking);
                    customers.push(customer);
                } else {
                
                let customerBooking = {
                    room_name:room.room_name,
                    date: booking.date,
                    start_time: booking.start_time,
                    end_time: booking.end_time,
                    booking_id: booking.booking_id,
                    booking_date:booking.booking_date,
                    status: booking.status
                };
                customers[customerExists].booking.push(customerBooking);
            }   
            })
        })
        if(customers.length>0){
            res.status(200).send(customers);
        } else {
            res.status(400).send("customer details not available")
        }
        
    } catch (error) {
        res.status(500).send("Server Error")
    }
})


module.exports = router;