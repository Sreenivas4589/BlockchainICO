const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

var nodemailer = require("nodemailer");


//for ethereu wallet
const Web3 = require("web3");
//infura link , logged in using gmail main acc
const web3 = new Web3(
  "https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"
);

const { EthHdWallet } = require("eth-hd-wallet");
var hdkey = require("ethereumjs-wallet/hdkey");
var bip39 = require("bip39");

const ETx = require("ethereumjs-tx");
const Transaction = require("ethereumjs-tx");

dotenv.config();
sgMail.setApiKey(`SG.${process.env.APIKEY}`);


const crypto =require('crypto');
const flash = require('connect-flash');
router.use(flash())



router.post("/register", async (req, res) => {
  console.log("register called", req.body);

  //checking if user already exists or not
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email Already Exists");
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  //hashing the password
  //10 is the complixity of the generated string
  
  //creating new ethereum acc for the signedup user
  const mnemonic = bip39.generateMnemonic(); //generates string
  // console.log(`mnemonic: ${mnemonic}`);

  const wallet = EthHdWallet.fromMnemonic(mnemonic);
  let address = wallet.generateAddresses(1);
  // console.log(`EthHdWallet Address: ${address}`);

  bip39.mnemonicToSeed(mnemonic).then((seed) => {
    // console.log(seed);
    var path = `m/44'/60'/0'/0/0`;
    var hdwallet = hdkey.fromMasterSeed(seed);
    var wallet = hdwallet.derivePath(path).getWallet();
    var address2 = "0x" + wallet.getAddress().toString("hex");
    var privateKey = wallet.getPrivateKey().toString("hex");
  

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    emailToken:crypto.randomBytes(64).toString('hex'),
    isVerified:false,
    privateKey: privateKey,
    Address: address2,
    Mnemonic: mnemonic,
  });

  user.save();


  

 
  //   //   console.log(`ethereumjs-wallet address: ${address2}`);

  //   const msgs = {
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
  //      console.log('verify email');
  // req.flash('success','please check your email to verify');
  
  //   }catch(error){
  //     console.log(error);
  //     req.flash('error','something went wrong');
     
  //   }
   
    

    
    
    

    //sending email

    
    const msg = {
      to: `${req.body.email}`,
      from: "sreenivasnaidu.ms@gmail.com",
      subject: "Welcome to our platform",
      html: ` <h1>Thank you for signing up to our platform , here are your wallet details </h1>
      <span> 
       <b> Private Key :</b>  <p>${privateKey} </p> <br>
       <b> Address : </b> <p> ${address2} </p> <br>
       <b> Mnemonic: </b> <p> ${mnemonic} </p> <br>
       <a href=" http://${req.headers.host}/api/user/verifyemail/token=${user.emailToken}">verify your account</a>
      </span>  
      `,
    };

    sgMail.send(msg, function (err, info) {
      if (err) {
        console.log("Errorin sending Mail", err);
        res.status(400).send(err);
      } else {
        console.log("Mail sent");
        res
          .status(200)
          .send(
            "SignUp Successful , Please check your email for wallet details"
          );
      }
    });
  });
});
router.get('/profile', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			return res.render('data.ejs', { "name": data.username, "email": data.email });
		}
	});
});




router.get('/verifyemail/:token',async(req,res,next)=>{
  console.log("verified");
  try{
    const user= await User.findOne({emailToken:req.query.emailToken});
    console.log("user",user);
    if(!user){
      res.status(400).send("Error Msg1")
    }
    user.emailToken =null;
    user.isVerified=true;
   await user.save();
   res.send("verified");

  }catch(error){
    console.log(error);
    res.status(400).send("Error Msg")
  }
});


router.post("/login", async (req, res) => {
  //checking if user already exists or not
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email Doesn't Exists");

  //if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid Password");

  //res.send("Logged in Successfully");
  // console.log("User logged in backend", user);
  //Create and assign a token , we can add any details inside the token eg name
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);


  let responseObject = {
    token: token,
    userDetails: user,
    // walletBalance: balance,
  };

  //adding token to the header
  // res.cookie("auth-token-poc", token);
  res.header("auth-token", token).send(responseObject);
});
router.get('/logout', (req, res, next) => {
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

module.exports = router;
