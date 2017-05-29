'use strict';
const express = require('express');
const app = express();
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const prompt = require('prompt');
const sendmail = require('sendmail')({silent: true})
let auth = {};
let mailOptions = {};

prompt.start();

prompt.get(['email'], function (err, result) {
    auth = {
        email: result.email
    }

    app.listen(3000, function(){
        console.log('Server start and listening on port 3000; http://localhost:3000/');
    });
});

app.use(express.static(path.join(__dirname, 'builds/dev')));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'builds/dev/index.html'));
});

app.post('/upload', function(req, res){
    let form = new formidable.IncomingForm();
    let attachments = []

    form.uploadDir = path.join(__dirname, '/uploads');
    form.multiples = true;

    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name));
        attachments.push({
            filename: file.name,
            path: path.join(form.uploadDir, file.name)
        });
    });

    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    form.parse(req, function ( err, field, files ) {

        mailOptions.from = auth.email || 'test@gmail.com';

        let html = '<ul>';
        const sex = field.male === 'true' ? 'Male' : 'Female';

        mailOptions.to = auth.email;

        if (field.copy === 'true' ) {
            mailOptions.to += ', ' + field.email;
        }
        //
        mailOptions.replyTo = field.email;
        mailOptions.subject = field.title;

        delete field.resume;
        delete field.portfolio;
        delete field.photo;
        delete field.copy;
        delete field.title;

        if (field.male === 'true') {
            delete field.female;
        } else if (field.female === 'true') {
            delete field.male;
        }

        Object.keys(field).map(function(key, index) {
            if (key === 'male' || key === 'female') {
                html += '<li>Sex: '+sex+'</li>'
            } else {
                html += '<li>'+capitalizeFirstLetter(key)+': '+field[key]+'</li>';
            }
        });
        html += '</ul>';

        mailOptions.html = html;
        mailOptions.attachments = attachments;

        sendmail(mailOptions, function (err, reply) {
            console.log(err && err.stack)
            console.dir(reply)
        })
        res.end('Message has been sent');
    });
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
