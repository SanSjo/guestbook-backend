# Guest book

This project is build with NodeJS and Express using MongoDB and mongoose as database.

I created two models, 
First: Guestbook User model, with a object including name, password and accessToken and routes with GET and PUSH with endpoints /signup, /login, as well as /login with id param for the user to access the memberpage. 
Second: Guestbook Message model, with an object including message and author. Also routes and endpoints in order to PUSH a new message, GET all messages, PUT to change a message and DELETE to delete a message.

## Getting started

Install dependencies with `npm install`, then start the server by running `npm run dev`
