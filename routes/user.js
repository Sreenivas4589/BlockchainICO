const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const _= require('lodash');
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const transaction = require("ethereumjs-tx");
const { ethers } = require("ethers");
var nodemailer = require("nodemailer");


//for ethereu wallet
const Web3 = require("web3");
//infura link , logged in using gmail main acc
const web3 = new Web3(
  "https://rinkeby.infura.io/v3/c2d9464693164ba6acfad15852dd81bf"
);
const contractABIToken =[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_maxTotalSupply",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxTotalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "updateAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const contractAddresstoken = "0x5316B71c88E43e334cd0CA8715B726D072F2B9a9";

//0x96885a15d6043e151f65b0d1943e80679ce7892b
const contractABIICO =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_duration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_availableTokens",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_minPurchase",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_maxPurchase",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "availableTokens",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "daiAmount",
				"type": "uint256"
			}
		],
		"name": "buy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "dai",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "duration",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "end",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxPurchase",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "minPurchase",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "price",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "sales",
		"outputs": [
			{
				"internalType": "address",
				"name": "investor",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "tokensWithdrawn",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "test",
				"type": "address"
			}
		],
		"name": "start",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract Token",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawDai",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] ;

const contractAddressICO = "0xB0BbE036E973f68C3BC4D92736223ed2361269b2";

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
console.log("73emailtoken",user.emailToken);
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
       <a href=" http://${req.headers.host}/api/user/verifyemail/${user.emailToken}">verify your account</a>
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
            "SignUp Successful , Please verify your email"
          );
      }
    });
  });
});

router.post("/Mint", async (req, res) => {
	//before this it for for sending token to another address , now recivers address and sender address is same hence it is purchase token
	console.log("BODY ", req.body);
	const owner = req.body.addressFrom;
	const privKey = req.body.privateKey;
	const amount = req.body.amount;
	const addressTo = req.body.addressFrom;
  
	let contract = new web3.eth.Contract(contractABIToken, contractAddresstoken);
  
	const privateKey = Buffer.from(privKey, "hex");
  
	let nonce = await web3.eth.getTransactionCount(owner);
  
	const transferFunction = contract.methods.mint(addressTo,amount).encodeABI();
  
	const NetworkId = await web3.eth.net.getId();
	const rawTx = {
	  from: owner,
	  to: contractAddresstoken,
	  data: transferFunction,
	  nonce: nonce,
	  value: web3.utils.toHex(amount.toString()),
	 
	  gasLimit: web3.utils.toHex(210000),
	  gasPrice: web3.utils.toHex(90000000000),
	  chainId: NetworkId,
	};
  
	let transaction = new Transaction(rawTx, {
	  chain: "rinkeby",
	  hardfork: "petersburg",
	});
  
	transaction.sign(privateKey);
  
	
  
	web3.eth.sendSignedTransaction(
	  "0x" + transaction.serialize().toString("hex"),
	  (err, hash) => {
		if (err) {
		   //console.log("erroorrrrrrrrrrrrrrrrrrrr", err.message);
		  res.status(400).send(err.message);
		  
		} else {
		  res.status(200).send(hash);
		}
	  }
	);
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
router.post("/startico", async (req, res) => {

	const owner = req.body.addressFrom;
  
	let contract = new web3.eth.Contract(contractABIICO, contractAddressICO);
	
	var start = await contract.methods.start(owner).call();
	
  
	res.send(start );
  });
  router.post("/vesting", async (req, res) => {
	//before this it for for sending token to another address , now recivers address and sender address is same hence it is purchase token
	console.log("BODY ", req.body);
	const owner = req.body.addressFrom;
	const privKey = req.body.privateKey;
	const amount = req.body.amount;
	const addressTo = req.body.addressTo;
  const message=req.body.message
	let contract = new web3.eth.Contract(contractABIICO, contractAddressICO);
  
	//const privateKey = Buffer.from(privKey, "hex");
  const privateKey=JSON.stringify(privKey);
	let nonce = await web3.eth.getTransactionCount(owner);
  
	const transferFunction = contract.methods.buy(owner,amount).encodeABI();
  
	const NetworkId = await web3.eth.net.getId();
	const rawTx = {
	  from: owner,
	  to: contractAddressICO,
	  data: transferFunction,
	  nonce: nonce,
	  value: web3.utils.toHex(amount.toString()),
	  gasLimit: web3.utils.toHex(210000),
	  gasPrice: web3.utils.toHex(1000000),
	  chainId: NetworkId,
	};
  
	let transaction = new Transaction(rawTx, {
	  chain: "rinkeby",
	  hardfork: "petersburg",
	});
  
	transaction.sign(privateKey);
	

	
	
  
	web3.eth.sendSignedTransaction(
	  "0x" + transaction.serialize().toString("hex"),
	  (err, hash) => {
		if (err) {
		  // console.log("erroorrrrrrrrrrrrrrrrrrrr", err.message);
		  res.status(400).send(err.message);
		} else {
		  res.status(200).send(hash);
		}
	  }
	);
  });
  

router.get('/verifyemail/:token',async(req,res)=>{
  console.log("verified",req.params);
  
  try{
    const user= await User.findOne({emailToken:req.params.token});
    console.log("user",user);
    if(!user){
      res.status(400).send("Error Msg1")
    }

    user.emailToken =null;
    user.isVerified=true;
   const userres=await user.save();
   res.send(userres);

  }catch(error){
    console.log(error);
    res.status(400).send("Error Msg")
  }
});
router.put("/forgot-password",async(req,res)=>{
const {email}=req.body;
User.findOne({email},(err,user)=>{
  if(err || !user){
    return res.status(400).json({error:"user with this mail does not exits"});
  }
const token =jwt.sign({_id:user._id},process.env.RESET_PASSWORD_KEY,{expiresIn:'20m'});
const data={
  to: `${req.body.email}`,
  from: "sreenivasnaidu.ms@gmail.com",
      subject: "Welcome to our platform",
      html: ` <h2>Thank you for signing up to our platform , here are your wallet details </h2>
      <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
`};
return user.updateOne({resetLink:token},function(err,success){
if(err){
  return res.status(400).json({error:"reset passwod link error"});
}else{
  sgMail.send(data, function (error, body) {

    if(error){
      return res.json({error:"error"});
    }
    res.status(400).send("email has been sent")
  });

}
});
})
});

router.put("/resetpassword",async(req,res)=>{
const {resetLink,newpass}=req.body;
if(resetLink){
jwt.verify(resetLink,process.env.RESET_PASSWORD_KEY,function(err,decodedData) {
  if(err){
    return res.status(401).json({error:"incorrect token"});
  }
User.findOne({resetLink},(err,user)=>{
  if(err || !user){
    return res.status(400).json({error:"user with this token doesnot exits"});
  }
  const obj ={
    password:newpass
  }
  //return user.updateOne({resetLink:token},function(err,success){

  user=_.extend(user,obj);
  user.save((err,result)=>{
	//user.updateOne({password:req.body.password},(err,result)=>{ 
if(err){
  return res.status(400).json({error:"resetpassword error"});
}else{
  return res.status(200).json({message:"newpassword has been changed"});
}
  })
})
})

}else{
     res.status(401).json({error:"Authentication error"});
}

});


router.post("/login", async (req, res) => {
  //checking if user already exists or not
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email Doesn't Exists");

  //if password is correct
 // const validPass = await bcrypt.compare(req.body.password, user.password);

  //if (!validPass) return res.status(400).send("Invalid Password");
  var passwordIsValid = bcrypt.compare(
	req.body.password,
	//console.log(req.body.password),
	user.password,
	//console.log(user.password)
  );

// if (req.body.password!=user.password){
// 	console.log(req.body.password)
// 	console.log(user.password)
  if (!passwordIsValid) {
	return res.status(401).send({
	  
	  message: "Password Mis-match"
	});
}
//   }else{
// 	res.send("Logged in Successfully");  
//   }
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
