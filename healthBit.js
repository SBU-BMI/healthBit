console.log('healthBit.js base library loaded')

// ini
hb = function(){
    // ini
    if((location.href.slice(0,16)=="http://localhost")||(location.href.slice(0,5)=="https")){
        hb.fitbit() // starting with fitbits
    }else{ // force ssl
        document.location.protocol='https:'
    }
}

hb.fitbit=function(){
    // login fitbit
    if(location.hash.length==0){ // if not returning from login
        var href=location.href
        if(href.slice(-1)=='#'){href=href.slice(0,-1)}
        location.href='https://www.fitbit.com/oauth2/authorize?client_id=229TL4&redirect_uri='+href+'&response_type=token&scope=profile'
    }else{
        hb.fitbit.login={}
        location.hash.slice(1).split('&').map(
            function(pp){
                var p = pp.split('=');
                hb.fitbit.login[p[0]]=p[1]
                //console.log(p)
            }
        )
        location.hash=""
        //console.log('login',hb.fitbit.login)
            
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

// ini

hb()