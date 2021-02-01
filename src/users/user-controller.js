const Person = require('./user-model');
const nodemailer = require("nodemailer");

class User {
    async insert(body, file) {
        let result = await Person.findOne({
            email: body.email
        })
        if (result) {
            return Promise.reject(new Error());
        } else {
            const userDetails = new Person({
                name: body.name,
                email: body.email,
                password: body.password,
                phone: body.phone,
                date: body.date,
                image: file.filename,
                address1: body.address1,
                address2: body.address2,
                city: body.city,
                state: body.state,
                zip: body.zip
            });
            let data = await userDetails.save();
            if (data) {
                return Promise.resolve(data)
            } else {
                Promise.reject(error);
            }
        }
    }
    mail(useremail) {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'shubham.7.10.1999@gmail.com',
                pass: '8126855405'
            }
        });

        // send mail with defined transport object
        let info = transporter.sendMail({
            from: '"Shubham Sharma" <shubham.7.10.1999@gmail.com>', // sender address
            to: useremail, // list of receivers
            subject: "This is a mail through nodeMailer", // Subject line
            text: "http://localhost:5000/reset_password/"+useremail, // plain text body
        });

        console.log("Message sent successfully");
    }
}

module.exports = User;