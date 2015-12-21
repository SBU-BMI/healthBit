console.log('healthBit.js base library loaded')

// ini
hb = function(){
    // ini
    if((location.href.slice(0,16)=="http://localhost")||(location.href.slice(0,5)=="https")){
        hb.connect()
        if(sessionStorage.logingIntoFitbit){
            hb.fitbit()
        }
        //hb.fitbit() // starting with fitbits
    }else{ // force ssl
        document.location.protocol='https:'
    }
}

hb.fitbit=function(scopes){
    if(!scopes){scopes='profile'}
    else{scopes=scopes.join('%20')} // scopes expected as an array
    // login fitbit
    if(!sessionStorage.logingIntoFitbit){ // if not returning from login then this is about loggin in
        var href=location.href
        if(href.slice(-1)=='#'){href=href.slice(0,-1)}
        //location.href='https://www.fitbit.com/oauth2/authorize?client_id=229TL4&expires_in=2592000&redirect_uri='+href+'&response_type=token&scope='+scopes
        sessionStorage.logingIntoFitbit=new Date()
        location.href='https://www.fitbit.com/oauth2/authorize?client_id=229TL4&redirect_uri='+href+'&device=fitbit&response_type=token&scope='+scopes
    }else{ // logged in fitbit
        sessionStorage.removeItem('logingIntoFitbit')
        hb.fitbit.login={}
        location.hash.slice(1).split('&').map(
            function(pp){
                var p = pp.split('=');
                hb.fitbit.login[p[0]]=p[1]
                //console.log(p)
            }
        )
        location.hash=""
        // assemble fitbit UI
        // 1. Prepare div
        if($('#healthBitFitbitConnected').length==0){ // prepare div
            var div = document.createElement('div')
            div.id = "healthBitFitbitConnected"
            healthBitFitbit.appendChild(div)
        }else{
            var div = document.getElementById("healthBitFitbitConnected")
        }
        
        // display connected
        div.innerHTML='Connected:'
        // scan each of the scopes
        hb.fitbit.login.scope=hb.fitbit.login.scope.split('+')
        // match checkboxes
        $('#healthBitFitbit > input').each(function(i,el){
            if(hb.fitbit.login.scope.indexOf(el.value)<0){
                el.checked=false
            }
        })
        hb.fitbit.scope={} // data about each scope will go here
        hb.fitbit.login.scope.forEach(function(sc){
            var divsc = document.createElement('div')
            divsc.id='fitbitScope_'+sc
            divsc.innerHTML='<h4 style="color:navy">'+sc+'</h4>'
            div.appendChild(divsc)
            // get some data for the given scope
            if(sc=='activity'){
                hb.fitbit.getActivity(divsc)
            }
            if(sc=='heartrate'){
                hb.fitbit.getHeartrate(divsc)
            }


            // get the data
            //hb.fitbit.get(sc)
        })
        //console.log('login',hb.fitbit.login)
        // old stuff, remove later   
        if(false){ 
        $.ajax({
            url : "https://api.fitbit.com/1/user/"+hb.fitbit.login.user_id+"/profile.json",
            headers: {'Authorization' : hb.fitbit.login.token_type+' '+hb.fitbit.login.access_token}
        }).then(function(x){
            var sp=hb.fitbit.login.scope.split('+').map(function(s){
                return '<li>'+s+'</li>'
            })
            hb.fitbit.info=x
            hb.fitbit.info.date=new Date
            
            var spn=hb.fitbit.login.scope.split('+').length
            sp='<ol>'+sp.join('')+'</ol>'
            $('<h2 style="color:maroon">Using OAUTH 2.0</h2><div id="healthBitScope" style="color:blue"> You gave me OAUTH to engage the following services:'+sp+'</div>').appendTo(healthBitDiv)
            $('<h3 style="color:maroon">Reading from your <i style="color:blue">profile</i> service</h3>').appendTo(healthBitDiv)
            $('<div style="color:navy"><p>Could instead be reading from any of the <span style="color:red">other '+(spn-1)+' services</span> listed above ...</p><p>Have a look at the <a href="https://dev.fitbit.com/docs/activity/" target=_blank>fitbit API documentation</a> to find out what type of data may be available.</p></div>').appendTo(healthBitDiv)
            var ol='<ol style="color:blue">'
            Object.getOwnPropertyNames(x.user).map(function(p){
                ol+='<li>'+p+': <span style="color:red">'+x.user[p]+'</span></li>'
            })
            ol+='</ol>'
            $(ol).appendTo(healthBitDiv)
            // full App
            hb.app(healthBitDiv)

        })
        }
    }
}

hb.fitbit.get=function(url,cb){
   $.ajax({
        url : url,
        headers: {'Authorization' : hb.fitbit.login.token_type+' '+hb.fitbit.login.access_token}
    }).then(function(x){
        cb(x)
    })
}

hb.fitbit.getActivity=function(div){
    // https://dev.fitbit.com/docs/activity
    //var url = "https://api.fitbit.com/1/user/"+hb.fitbit.login.user_id+"/activities/date/today.json"
    var url = "https://api.fitbit.com/1/user/"+hb.fitbit.login.user_id+"/activities/steps/date/today/1m.json"
    hb.fitbit.get(url,function(x){
        var time=[],steps=[]
        x["activities-steps"].forEach(function(xi,i){
            time[i]=new Date(xi.dateTime)
            steps[i]=parseFloat(xi.value)
        })
        var divPlot=document.createElement('div')
        div.appendChild(divPlot)
        Plotly.plot( divPlot, [{
	       x: time,
	       y: steps }], {
	       margin: { t: 0 } } 
	    )
    })
}

hb.fitbit.getHeartrate=function(div){
    // https://dev.fitbit.com/docs/heart-rate
    //var url = "https://api.fitbit.com/1/user/"+hb.fitbit.login.user_id+"/activities/date/today.json"
    var url = "https://api.fitbit.com/1/user/"+hb.fitbit.login.user_id+"/activities/heart/date/today/1m.json"
    hb.fitbit.get(url,function(x){
        var time=[],heart={}
        x["activities-heart"].forEach(function(xi,i){
            time[i]=new Date(xi.dateTime)
            xi.value.heartRateZones.forEach(function(v){
            	if(!heart[v.name]){
            		heart[v.name]={
            		    values:[],
            		    range:[v.min,v.max]
            		}
            	}else{
            		heart[v.name].values[i]=v.minutes
            	}
            })
            4
        })
        var divPlot=document.createElement('div')
        div.appendChild(divPlot)
        Plotly.plot( divPlot,
        	[
        		{
        			x: time,
        			y: heart["Out of Range"].values,
        			mode: 'markers',
        			type: 'scatter',
        			name: "Out of Range ("+heart["Out of Range"].range.join('-')+")"
        		},
        		{
        			x: time,
        			y: heart["Fat Burn"].values,
        			mode: 'markers',
        			type: 'scatter',
        			name: "Fat Burn ("+heart["Fat Burn"].range.join('-')+")"
        		}
	       	], 
	       	{margin: { t: 0 } } 
	    )
    })
}


hb.app=function(div){ // full App
    console.log('full app being assembled ')
    $('<h3 style="color:maroon">Tentative App #1 <hr></h3>').appendTo(div)
    // app1 configured as a table within hosting div
    $('<div id="app1"></div>').appendTo(div)
    $('<table id="app1Table"><tr id="app1Head"><td><img src="helilogo.png" width=60><br><i style="color:maroon">Helicopter<hr></i></td><td style="vertical-align:top" align="right">Logged in as <span style="color:blue">'+hb.fitbit.info.user.displayName+'</span> at <span style="color:blue">'+hb.fitbit.info.date.toString().slice(4,24)+'</span><p id="app1Msg" style="color:red">processing ...</p></td></tr><td id="app1Options"></td><td><tr></tr></table>').appendTo(app1)
    // filing options
    hb.fitbit.login.scopes=hb.fitbit.login.scope.split('+')
    hb.fitbit.login.scopes.forEach(function(s){
        $('<p id="app1_'+s+'" style="color:gray">'+s[0].toUpperCase()+s.slice(1)+'</p>').appendTo(app1Options)
    })
}

// connect
hb.connect=function(){
    var h = '<h3 style="color:maroon">Connect your devices</h3>'
    
    // FitBit
    h+='<div id="healthBitFitbit">'
    h+='<h4 style="color:maroon"healthBitConnectFitbit><li>FitBit <a href="https://www.fitbit.com/" target="_blank"><i class="fa fa-external-link"></i></a></li></h4>'
    var scp = ['activity','heartrate','location','nutrition','settings','sleep','social','weight']
    for(var i=0;i<scp.length;i++){
       var p=scp[i]
       h+=p+':<input id="'+p+'Checkbox" type="checkbox" checked="true" value='+p+'> '
    }
    h+='<br><button id="connectFitBit" class="btn-primary" onclick="hb.connectFitBit(this)">Connect your fitbit</button> for the selected scopes.'
    h+='</div>'
    // connect your own
    h+='<div id="healthBitChoseYourOwn">'
    h+='<h4 style="color:maroon"><li>Chose your own, say for <input id="choseYourOwnInput" type="text" value="heart" size=5 style="color:blue;text-align:center"> monitoring <a  id="choseYourOwnLink" href="https://www.wearable-technologies.com/?s=heart" target="_blank"><i class="fa fa-external-link"></i></a></li></h4>'
    h+='<a href="mailto:jonas.almeida@stonybrookmedicine.edu" target="_blank">Tell us</a> about a device you want to use at Stony Brook Univ, get us one, and we will try to add it here.'
    h+='</div>'
   

    //https://www.wearable-technologies.com/2015/04/wearables-in-healthcare/

    hbAction.innerHTML=h
    // even listeners
    choseYourOwnInput.onkeyup=function(evt){
        this.size=Math.max(4,this.value.length) // adjust size
        choseYourOwnLink.href=choseYourOwnLink.href.match(/[^?]*/)[0]+'?s='+this.value
        if(evt.keyCode==13){
            choseYourOwnLink.click()
        }
        4
    }
}

hb.connectFitBit=function(that){
    // get scopes
    var scopes=['profile'] // also profile by default]
    $('#healthBitFitbit > input').each(function(i,el){
        //console.log(i,el)
        if(el.checked){
            scopes.push(el.value)
        }
    })
    hb.fitbit(scopes)
    
}

// ini
$(document).ready(function(){
    hb()
})
