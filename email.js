var express=require('express');
var nodemailer = require("nodemailer");
var app=express();
/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "sreenivasnaidu.ms@gmail.com",
        pass: "Sreenivas@1"
    }
});
var rand,mailOptions,host,link;


app.get('/',function(req,res){
    res.sendfile('index.html');
});
app.get('/send',function(req,res){
        rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,Please Click on the link to verify your email"+link+"Click here to verify"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
            console.log("Message sent: " + response.message);
        res.end("sent");
         }
});
});

app.get('/verify',function(req,res){
console.log(req.protocol+":/"+req.get('host'));
if((req.protocol+"://"+req.get('host'))==("http://"+host))
{
    console.log("Domain is matched. Information is from Authentic email");
    if(req.query.id==rand)
    {
        console.log("email is verified");
        res.end("Email "+mailOptions.to+" is been Successfully verified");
    }
    else
    {
        console.log("email is not verified");
        res.end("Bad Request");
    }
}
else
{
    res.end("Request is from unknown source");
}
});



app.listen(3000,function(){
    console.log("Express Started on Port 3000");
});

// const msgs = {
//     to: `${req.body.email}`,
//     from: "sreenivasnaidu.ms@gmail.com",
//     subject: "Welcome to our platform , please verify your email",
//     text:`Hello thanks for registering.
//     please copy and paste the address below to verify your account.
//     http://${req.headers.host}/verify-email?token=${user.emailToken}`,
//     html: ` <h1>Thank you for signing up to our platform. </h1>
//     <p>please click the link below to verify your account</p>
//     <a href=" http://${req.headers.host}/verify-email?token=${user.emailToken}">verify your account</a>
      
//     `,
//   }
//   try{
//      sgMail.send(msgs);
// req.flash('success','please check your email to verify');
// res.redirect('/');
//   }catch(error){
//     console.log(error);
//     req.flash('error','something went wrong');
//     res.redirect('/');
//   }
 