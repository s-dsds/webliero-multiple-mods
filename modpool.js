var modCache = new Map();
var modpool = [];
var modpoolrand = []
var currMod = -1;
var randomizeFightMod = false;

let modBaseUrl = 'https://webliero.gitlab.io/webliero-mods'

async function getModData(modUrl) {    
    let obj = modCache.get(modUrl)
    if (obj) {
      return obj;
    }
    try {
        obj = await (await fetch(modUrl)).arrayBuffer();        
    }catch(e) {
        return null;
    }

    
    modCache.set(modUrl, obj)
    return obj;
}

async function loadMod(modname) {
    const mod = await getModData(getModUrl(modname))
    window.WLROOM.loadMod(mod);
}

function getModUrl(name) {
    if (name.substring(0,8)=='https://') {
        return name;
    }
    return modBaseUrl + '/' +  name;
}


function getCurrentMod() {
    return modpoolrand[currMod];
}
function getNextRandomMod() {
    return currMod+1<modpoolrand.length?currMod+1:0;    
}

function setNextRandomMod() {
    currMod=getNextRandomMod();    
}

function setRandomFightMod(off=false) {
    randomizeFightMod=(!off);
}

let maxRoundsPerMod = 3;
function shouldChangeMod() {
    console.log("should change mod",  currMod<0 || (randomizeFightMod && roundPlayedOnThatMod>=maxRoundsPerMod))
    return currMod<0 || (randomizeFightMod && roundPlayedOnThatMod>=maxRoundsPerMod)
}

var lastPlayedMod = null;
var roundPlayedOnThatMod = 0;

function printCurrentMod(msg, player=null, color= COLORS.ANNOUNCE) {
    let str = modpool[getCurrentMod()].name
    announce(msg+str, player, color);
}

function setModAdvance() {
    if (currMod!=lastPlayedMod) {
        roundPlayedOnThatMod=1
    }
    lastPlayedMod = currMod
    roundPlayedOnThatMod++
}

function shuffleModPool() {
    modpoolrand = Array.from(modpool);
    shuffleArray(modpoolrand);
}

chainFunction(window.WLROOM, 'onGameStart', setModAdvance) 

COMMAND_REGISTRY.add("clearmodcache", ["!clearmodcache: clears the entire modcache"], (player, ...name) => {
    modCache = new Map();
    notifyAdmins(`mod cache cleared by ${player.name}`);
    return false;
}, COMMAND.ADMIN_ONLY);


COMMAND_REGISTRY.add(["randommod","rm"], ["!randommod #number# or !rm #number: switches to random fight mod, use '!randommod 0' to switch off"], (player, num ='0')=> {

    let maxRoundsPerMod=+num;
    setRandomFightMod(maxRoundsPerMod==0);
    if (maxRoundsPerMod==0) {
        printCurrentMod(`mod is set to mod: `);        
    } else {
        announce(`mod is set to be randomized after ${maxRoundsPerMod} game`+(maxRoundsPerMod?'s':''), null, COLORS.ANNOUNCE);
    }
    
    return false;
},  COMMAND.ADMIN_ONLY);