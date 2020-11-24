//DEBUG PART --- Prompt on app page
/*
const http = require('http')
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  try {
      //dependencies
    const Discord = require('discord.js');
    const fs = require('fs');
    
    //loading files
    let config = require('./config.json');
    let index = require('./index.json')
    res.end(JSON.stringify(index, null, 2));
  } catch (error){
      res.end('Failed to load discord.js! \n');
  }
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/

//Debug with schizo server
var http = require('http');

var d1 = new Date();
console.log(d1.toUTCString() + ': initialized. ')

//Timeout
function timeout(ms){
        return new Promise(resolve => setTimeout(resolve(), ms));
    }

async function afterTime(){
    console.log("startoftimeOut");
    await new Promise((resolve, reject)=>{
    // wait for 50 ms.
    setTimeout(function(){resolve()}, 150000);
    });
    
    //timestamp
    var d2 = new Date();
    console.log("This will appear after waiting for 1000 ms");
    console.log(d2.toUTCString() + ": timeout end") ;
    
    //create new request
    const https = require('https')
    const options = {
      hostname: 'shimbo.be',
      path: '/BimBot'
    }
    
    const req = https.request(options)
    
    req.on('error', error => {
      console.log(error.ToString())
    })
    
    req.end();
    }

var server = http.createServer(function(req, res) {
    var d = new Date();
    console.log(d.toUTCString() + ': Request received. ')
    
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var message = 'It works!\n',
        version = 'NodeJS ' + process.versions.node + '\n',
        response = [message, version].join('\n');
    res.end(response);
    
    //create response
    afterTime();
    
});
server.listen();


//dependencies
const Discord = require('discord.js');
const fs = require('fs');

//loading files
let config = require('./config.json');
let index = require('./index.json')

//connecting to Discord
const client = new Discord.Client();

//message color formatting
const vert = {"a":"```CSS\n", "z" : "\n```"};
const rouge = {"a": "```CSS\n[", "z" : "]\n```"};
const bleu = {"a":"```ini\n[", "z" : "]\n```"};
const orange = {"a":"```fix\n", "z" : "\n```"};

//log bot initialization
fs.writeFileSync('botlog.txt','Bot initialized')


//confirm startup
client.on('ready', () => {
console.log('Connecté en tant que : ' + client.user.tag)
})
client.login(config['token'])

//read user message to deduce target zone to modify
function Zone(msg) {
//check for standard case "EMX"
	let zone = {"user":"unset", "id":"", "section":"emx", "name":"", "first_name":"L'EMX de ", "last_name":"unset"}
	Object.entries(index["zone"]).forEach( current => {
		current[1]["tags"].forEach( tag => {
			if (msg.content.toLowerCase().includes(tag,1)){
				zone["last_name"]= current[1]["name"]
				zone["user"]= current[1]["users"]["emx"]
				zone["id"]= current[1]["id"]
				//check for Sub Zones
				Object.entries(index["sub_zone"]).forEach( sub => {
					sub[1]["tags"].forEach( tag => {
						if (msg.content.toLowerCase().includes(tag,1)){
							zone["first_name"]= sub[1]["name"]
							if (current[1]["users"][sub[1]["id"]] === undefined){
								current[1]["users"][sub[1]["id"]] = "--"
								zone["user"]= current[1]["users"][sub[1]["id"]]
								zone["section"]= sub[1]["id"]
							}else{
								zone["user"]= current[1]["users"][sub[1]["id"]]
								zone["section"]= sub[1]["id"]
							}
						}
					})
				})
			}
		})
	})
	//check for associated_zones

	Object.entries(index["associated_zone"]).forEach( associated => {
		associated[1]["tags"].forEach( tag => {
			if (msg.content.toLowerCase().includes(tag,1)){
				Object.entries(associated[1]["zones"]).forEach( current => {
					current[1]["specific"].forEach( specific => {
						if (msg.content.toLowerCase().includes(specific,1)){
							zone["first_name"] = current[1]["name"]
							zone["last_name"] = index["zone"][current[1]["zone_id"]]["name"]
							zone["id"] = current[1]["zone_id"]
							try{
								if (index["zone"][current[1]["zone_id"]]["users"][current[0]] === undefined){
									index["zone"][current[1]["zone_id"]]["users"][current[0]] = "--"
									zone["user"]= index["zone"][current[1]["zone_id"]]["users"][current[0]]
									zone["section"]= current[0]
									console.log("error")
								}else{
									zone["user"]= index["zone"][current[1]["zone_id"]]["users"][current[0]]
									zone["section"]= current[0]
									console.log("normal")
								}
							}catch{
								index["zone"][current[1]["zone_id"]]["users"][current[0]] = "--"
								zone["user"]= index["zone"][current[1]["zone_id"]]["users"][current[0]]
								zone["section"]= current[0]
								console.log("error")
							}
						}
					})
				})
			}
		})
	})

	if (zone["last_name"] === "unset"){
		return 0;
	}
	zone["name"] = zone["first_name"]+zone["last_name"]
	return zone
}

//assignating target zone to user depending on availability
function Assigner(msg){

	if (msg.content.startsWith("+")){
		let assigned_zone = Zone(msg)
		if (assigned_zone === 0 ) {return "error";}
		if (assigned_zone["user"] === msg.author.username){
			return `!Tu es déjà l'occupant de ${assigned_zone["name"]}`
		}
		if (assigned_zone["user"] !== "--"){
			return "! Attention ! " + `${assigned_zone["name"]} est déjà occupé par ${assigned_zone["user"]} !!`}
		if (msg.content.startsWith("+@")){
			slice_start = 2;
			slice_end = msg.content.lastIndexOf("@")+1;
			if (slice_end === slice_start){ return "!Attention, Pour donner une assigned_zone à un externe, tu commencer par +@nom de l'externe@ en n'oubliant pas le second @"};
			externe = msg.content.slice(slice_start, slice_end);
			index[assigned_zone["id"]]["users"][assigned_zone["section"]] = externe;
			return `? Tu viens de donner ${assigned_zone["name"]} à ${externe}.`
		}

		index["zone"][assigned_zone["id"]]["users"][assigned_zone["section"]] = msg.author.username;
		return assigned_zone;
	};
	if (msg.content.startsWith("-")){
		let assigned_zone = Zone(msg)
		if (assigned_zone === 0 ) {return "error";}
		if (assigned_zone["user"] === "--"){
			if (assigned_zone["name"].startsWith("Les")){
				return `?${assigned_zone["name"]} sont déjà libres`;
			}else{
				return `?${assigned_zone["name"]} est déjà libre`;
			}
		}
		if (assigned_zone["user"] !== msg.author.username){
			if (msg.content.startsWith("---") || msg.content.startsWith("-!-") || msg.content.startsWith("~~~")){
				occupant = assigned_zone["user"];
				assigned_zone["user"] = "--";
				index["zone"][assigned_zone["id"]]["users"][assigned_zone["section"]] = "--";
				return `? Tu viens d'éjecter ${occupant} de ${assigned_zone["name"]}`;
			}else{
				return `! Attention ! Ce fichier est bloqué par ${assigned_zone["user"]}`;
			}
		}

		assigned_zone["user"] = "--";
		index["zone"][assigned_zone["id"]]["users"][assigned_zone["section"]] = "--";
		return assigned_zone;
	};
	return "error";
};

//assignating target zone to user depending on availability
function FormatData(data){
	let red_start = "[";
	let red_end = "]";
	let green_start = "```CSS\n";
	let green_end = "\n```";

	let out_string = "";

	Object.entries(data["zone"]).forEach( zone => {
		out_string += green_start + zone[1]["name"] + " "
		 Object.entries(zone[1]["users"]).forEach( sub => {
			if (sub[1] ===  "--"){
			}
			else
			{
				out_string += "\n" + red_start + Maj(sub[0]) +  ": " + sub[1] + red_end;
			}
		})
		out_string += green_end
	})

	return out_string
}

function Maj(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Refresh reference pinned message
async function UpdateRef(msg){
	try{
		var ref = await msg.channel.fetchMessage(config['messageId']);
		console.log('Reference Message Updated');
		//et le mettre à jour
	    ref.edit(FormatData(index));
	}catch(e){
		console.log(e.stack);
		var ref = None;
	}
	return ref;
}

client.on('message', async (message) => {

	//créer le message de référence s'il n'existe pas
	if  (config['messageId'] === ""){
		annonce = "BIMBOT est entrain d'évoluer"

		if (message.content === annonce){
			var id = message.id;
			config['messageId'] = id;
			fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
			console.log("BOT opérationnel");
		} else {
			message.channel.send(annonce);
			console.log("création du message de référence");
		}
	}

	//Show current DB
	if (message.content.startsWith("??")){
		UpdateRef(message);
		message.channel.send(FormatData(index));
	}

	//Release all owned Zones
	if (message.content === "-tout"){
		released = ""
		Object.entries(index["zone"]).forEach( current => {
			Object.entries(current[1]["users"]).forEach( user =>{
				if (user[1] === message.author.username){
					released += " - " + current[1]["name"]+ ": " + Maj(user[0]) + "\n"
					index["zone"][current[1]["id"]]["users"][user[0]] = "--"
				}
			})
		})
		if (released !== "" ){
			annonce = vert.a + message.author.username + " a libéré les zones:\n"
			annonce += released + vert.z
			message.channel.send(annonce)
			UpdateRef(message)
			fs.writeFileSync('index.json', JSON.stringify(index, null, 2))
			
		}else{
			message.reply("C'est bon, tu n'avais aucune zone à libérer ! :)")
		}
		return;
	}

	//Les messages pour prendre un fichier EMx
	if (message.content.startsWith("+") || message.content.startsWith("-")) {

		let assigned = Assigner(message)
		if (assigned === "ignore"){return;}
		console.log(assigned["name"])

		fs.writeFileSync('index.json', JSON.stringify(index, null, 2))

	if (assigned === "error"){
		message.reply("Je n'ai pas compris, peux-tu répéter?");
		return;}
	if (assigned[0] === "!"){
		message.reply(assigned);
		return;
	}
	if (assigned[0] === "?"){
		message.reply(assigned.slice(1));
		return;
	}


		//récupérer le msg du bot
		ref = UpdateRef(message);

		if (message.content.startsWith("+")){
			message.channel.send(`${bleu.a} ${message.author.username} prend la zone : ${assigned["name"]}${bleu.z}`)
		}
		else {
			if (assigned["name"].startsWith("Les")){
				message.channel.send(`${vert.a} ${assigned["name"]} sont maintenant libres ${vert.z}`)
			}else{
				message.channel.send(`${vert.a} ${assigned["name"]} est maintenant libre ${vert.z}`)
			}
		}
	};
});

// Error handeling
client.on('disconnect', () => {
	console.log("coucou t'es déco")
} )
client.on('error', e => {
	console.log("!! Erreur Client Discord !! " + e.name + ": " + e.message)
	return;
})
