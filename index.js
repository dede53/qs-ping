var pingAdapter					= require('ping');
var adapter 					= require('../../adapter-lib.js');

var ping 						= new adapter({
	"name": "Ping",
	"loglevel": 3,
	"description": "Prüft Netzwerkgeräte auf aktivität.",
	"settingsFile": "ping.json"
});


var status 			= {};

ping.settings.hosts.forEach(function(host){
	status[host.ip] = {};
	status[host.ip].status = false;
	status[host.ip].ip = host.ip;
	status[host.ip].name = host.name;
	status[host.ip].lastChange = Math.round(new Date().getTime()/1000);
});


function checkHosts (){
	ping.settings.hosts.forEach(function (host) {
		pingAdapter.sys.probe(host.ip, function(isAlive){
			ping.log.debug('Prüfe ip ' + host.ip + ' auf anwesenheit.');
			if(status[host.ip].status == isAlive){
				status[host.ip].lastChange 	= Math.round(new Date().getTime()/1000);
				ping.log.debug('	Ergebnis: Kein veränderter Status! Das Gerät ist immernoch ' + status[host.ip].status);
				return;
			}
			if(isAlive == true){
				ping.log.debug('	Ergebnis: anwesend');
				status[host.ip].lastChange 	= Math.round(new Date().getTime()/1000);
				status[host.ip].status 		= isAlive;

				ping.setVariable("ping." + host.name, status[host.ip].status);
				return;
			}
			
			ping.log.debug('	Ergebnis: abwesend', "data");
			var time = Math.round(new Date().getTime()/1000) - status[host.ip].lastChange;
			if(time >= ping.settings.minTime){
				status[host.ip].status 		= isAlive;
				status[host.ip].lastChange 	= Math.round(new Date().getTime()/1000);
				ping.setVariable("ping." + host.name, status[host.ip].status);
				ping.log.info('	Gerät (' + host.ip + ') ist länger als ' + ping.settings.minTime + ' Sekunden abwesend. Status wurde geändert.');
			}else{
				ping.log.info('	Gerät (' + host.ip + ') noch keine ' + ping.settings.minTime + ' Sekunden abwesend! Erst ' + time + ' Sekunden sind verstrichen.');
			}
		});
	});
}

setInterval(checkHosts, parseInt(ping.settings.interval) * 10000);
