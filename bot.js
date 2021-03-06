const Discord = require('discord.js');
const auth = require('./auth.json');
const getJSON = require('get-json');
const fs = require('fs');

// Initialize Discord Bot
const bot = new Discord.Client();
const INSULT_PATH = 'insults.txt'

function joke(category,time,message){
    getJSON('https://www.reddit.com/r/jokes/' + category + '.json?t=' + time, (err, response) => {
        
        var titleArr = [];
        var answerArr = [];

        if(!err){
            if(response.data.children!=''){
                response.data.children.forEach((child) => {
                    titleArr.push(child.data.title);
                    answerArr.push(child.data.selftext);

                });
    
                var num_posts= titleArr.length;
                var post_load_num = Math.round(Math.random() * (num_posts - 1));
                message.channel.send(titleArr[post_load_num] + '\n||' + answerArr[post_load_num] + '||');
            }else{
                message.channel.send("Empty response.");

            }
            
        }else{
            message.channel.send("Invalid URL.");
            
        }
    }).catch(function(){
        console.log("Error has occured");
    });   
}

function parseSubreddit(subName,category,time,message){

    getJSON('https://www.reddit.com/r/' + subName + '/' + category + '.json?t=' + time, (err, response) => {
        
        var subArr = [];

        if(!err){
            if(response.data.children!=''){
                response.data.children.forEach((child) => {
                    subArr.push(child.data.title);
                });
    
                var num_posts= subArr.length;
                var post_load_num = Math.round(Math.random() * (num_posts - 1));
                message.channel.send(subArr[post_load_num]);
            }else{
                message.channel.send("Empty subreddit.");

            }
            
        }else{
            message.channel.send("Invalid subreddit URL.");
            
        }
    }).catch(function(){
        console.log("Error has occured");
    });   
}


bot.on('ready', () => {
    console.log('I am ready!');
});

bot.on('message', async (message) => {
    if (message.content.includes(":Kappapride:")) {
        await new Promise(r => setTimeout(r, 1000));
        message.channel.send('HA! GaaAAAY!');
    }

    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];

        args = args.slice(1);

        switch(cmd.toLowerCase()) {
            case 'ping':
                message.channel.send('Pong!')
            break;

            case 'marco':
                message.channel.send('Polo!');
            break;

            case 'insult':
                var user = ""
                if (args.length > 0) {
                    user = message.mentions.members.first();
                }

                getJSON('https://www.reddit.com/r/insults/top.json?t=month', (err, response) => {
                    var insultArr = [];
                    fs.readFile(INSULT_PATH, 'utf-8', (err, data) => {
                        if (err) throw err;
                        insultArr = data.split('\n');
                        insultArr.pop();

                        response.data.children.forEach((child) => {
                            insultArr.push(child.data.title);
                        });

                        numInsults = insultArr.length;
                        rndNum = Math.round((Math.random() * numInsults) - 1);

                        if (user != "") {
                            message.channel.send(user + ', ' + insultArr[rndNum]);
                        } else {
                            message.channel.send(insultArr[rndNum]);
                        }
                    });

                    
                });
            break;
            case 'addinsult':
                fs.open(INSULT_PATH, 'a', (err, fd) => {
                    if (err) throw err;

                    var insultStr = '';
                    args.forEach((item) => {insultStr = insultStr.concat(' ', item)});

                    fs.write(fd, insultStr.trim() + '\n', (err) => {if (err) throw err});

                    fs.close(fd, (err) => {
                        if (err) throw err;
                    });
                });
            break;


            case 'thought':
                parseSubreddit("showerthoughts","top","month",message);
               
            break;

            case 'fact':
                parseSubreddit("todayilearned","top","month",message);
               
            break;

            case 'joke':
                switch(args.length){
                    case 0:
                        joke("top","month",message);
                    break;
                    case 1:
                        joke(args[0],"month",message);
                    break;
                    case 2:
                        joke(args[0],args[1],message);
                    break;

                }
            break;

            case 'sub':
                switch(args.length){
                    case 0:
                        message.channel.send("Require a subreddit to use. Try \' sub showerthoughts top all\'");
                    break;
                    case 1:
                        if(args[0] =="help")
                            message.channel.send("Usage: !sub <subreddit> <category> <time>\nCan be used by: !sub showerthoughts top all\nTime and category can be omitted.")
                        else
                            parseSubreddit(args[0],"top","month",message);
                    break;
                    case 2:
                        parseSubreddit(args[0],args[1],"month",message);
                    break;
                    case 3:
                        parseSubreddit(args[0],args[1],args[2],message);
                    break;
                }
    

            break;



            case 'help':
                message.channel.send('Available Commands:\n\n\
            !ping - The bot responds Pong!\n\
            !marco - The bot responds Polo!\n\
            !insult - Sends an insult randomly chosen from the top posts of the last month on r/insults\n\
            !thought - Sends an showerthought randomly chosen from the top posts of the last month on r/showerthoughts\n\
            !fact - Sends a fact randomly chosen from the top posts of the last month on r/todayilearned\n\
            !sub - Display a post from any subreddit given a name, and optional category and time. See !sub help\n\
            !joke - Sends a joke randomly chosen from r/jokes, from top month by default, or any category or time given \n\
            ')
                    
            break;
         }
     }

     if (message.content === 'how to embed') {
        // We can create embeds using the MessageEmbed constructor
        // Read more about all that you can do with the constructor
        // over at https://discord.js.org/#/docs/main/stable/class/RichEmbed
        const embed = new Discord.RichEmbed()
          // Set the title of the field
          .setTitle('A slick little embed')
          // Set the color of the embed
          .setColor(0xFF0000)
          // Set the main content of the embed
          .setDescription('Hello, this is a slick embed!');
        // Send the embed to the same channel as the message
        message.channel.send(embed);
     }
});

bot.login(auth.token);